import { Platform } from 'react-native';
import * as RNIap from 'expo-iap';
import { apiClient } from '../api/client';
import {
  ALL_APPLE_SUBSCRIPTION_SKUS,
  getAppleProductIdForPlan,
} from '../config/iapConfig';

export interface AppleProductInfo {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
}

export interface VerificationResult {
  success: boolean;
  plan?: string;
  billingCycle?: string;
  status?: string;
  message?: string;
  error?: string;
}

class AppleIAPService {
  private isConnected: boolean = false;
  private productCache: Map<string, any> = new Map();

  /**
   * Initializes StoreKit connection safely.
   */
  async init(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      if (!this.isConnected) {
        await RNIap.initConnection();
        this.isConnected = true;
      }
      return true;
    } catch (err: any) {
      // In simulator or dev mode without StoreKit certificate, log notice quietly without triggering dev LogBox banner
      if (__DEV__) {
        console.log('[AppleIAPService] initConnection notice (StoreKit simulator):', err?.message || err);
      }
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Closes connection when unmounting.
   */
  async end(): Promise<void> {
    if (Platform.OS !== 'ios' || !this.isConnected) {
      return;
    }
    try {
      await RNIap.endConnection();
    } catch {
      // Ignored
    } finally {
      this.isConnected = false;
    }
  }

  /**
   * Fetches Apple Subscriptions with localized prices from StoreKit.
   */
  async getSubscriptions(): Promise<Map<string, any>> {
    if (Platform.OS !== 'ios') {
      return this.productCache;
    }

    try {
      const initialized = await this.init();
      if (!initialized) return this.productCache;

      let subscriptions: any[] = [];
      if (typeof (RNIap as any).fetchProducts === 'function') {
        subscriptions = (await (RNIap as any).fetchProducts({
          skus: ALL_APPLE_SUBSCRIPTION_SKUS,
          type: 'subs',
        })) || [];
      } else if (typeof (RNIap as any).getSubscriptions === 'function') {
        subscriptions = (await (RNIap as any).getSubscriptions({
          skus: ALL_APPLE_SUBSCRIPTION_SKUS,
        })) || [];
      }

      this.productCache.clear();
      if (Array.isArray(subscriptions)) {
        for (const sub of subscriptions) {
          const key = sub?.id || sub?.productId;
          if (key) {
            // Normalize localized price across expo-iap versions
            if (!sub.localizedPrice && sub.displayPrice) {
              sub.localizedPrice = sub.displayPrice;
            }
            this.productCache.set(key, sub);
          }
        }
      }
      return this.productCache;
    } catch (err: any) {
      console.warn('[AppleIAPService] getSubscriptions error:', err?.message || err);
      return this.productCache;
    }
  }

  /**
   * Returns cached subscription info for a given plan and billing cycle.
   */
  getCachedProduct(planSlug: string, billingPeriod: 'monthly' | 'yearly'): any {
    const sku = getAppleProductIdForPlan(planSlug, billingPeriod);
    return this.productCache.get(sku);
  }

  /**
   * Purchases an Auto-Renewable Subscription through Apple StoreKit,
   * sends the receipt/transaction to the UwoConnect backend for verification,
   * and finalizes the transaction.
   */
  async purchasePlanSubscription(
    planSlug: string,
    billingPeriod: 'monthly' | 'yearly'
  ): Promise<VerificationResult> {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'In-App Purchases are only supported on iOS.' };
    }

    const sku = getAppleProductIdForPlan(planSlug, billingPeriod);

    try {
      const initialized = await this.init();
      if (!initialized) {
        return { success: false, error: 'Could not connect to Apple App Store.' };
      }

      // 1. Trigger Apple Native StoreKit Purchase Sheet
      // expo-iap requires: { request: { apple: { sku } }, type: 'subs' }
      let purchaseResult: any;
      if (typeof (RNIap as any).requestPurchase === 'function') {
        purchaseResult = await (RNIap as any).requestPurchase({
          request: {
            apple: { sku },
          },
          type: 'subs',
        });
      } else if (typeof (RNIap as any).requestSubscription === 'function') {
        purchaseResult = await (RNIap as any).requestSubscription({ sku });
      }

      let purchase: any = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;

      // Fallback: Check available purchases if StoreKit completed transaction without returning object directly
      if (!purchase) {
        try {
          const available = await RNIap.getAvailablePurchases();
          if (Array.isArray(available) && available.length > 0) {
            purchase = available.find((p: any) => p?.productId === sku || p?.id === sku) || available[0];
          }
        } catch (availErr) {
          console.warn('[AppleIAPService] getAvailablePurchases fallback warning:', availErr);
        }
      }

      if (!purchase) {
        return { success: false, error: 'Purchase was not completed.' };
      }

      // 2. Extract transaction and receipt details
      let receiptData = (purchase as any)?.transactionReceipt || (purchase as any)?.purchaseToken;
      if (!receiptData && Platform.OS === 'ios') {
        try {
          if (typeof (RNIap as any).getReceiptDataIOS === 'function') {
            receiptData = await (RNIap as any).getReceiptDataIOS();
          }
        } catch (receiptErr) {
          console.warn('[AppleIAPService] getReceiptDataIOS warning:', receiptErr);
        }
      }

      const transactionId = (purchase as any)?.transactionId || (purchase as any)?.id;
      const originalTransactionId =
        (purchase as any)?.originalTransactionIdentifierIOS ||
        (purchase as any)?.originalTransactionId ||
        transactionId;

      // 3. Send to UwoConnect backend for secure verification & plan activation
      const verifyRes = await apiClient.post<any>('/api/payments/apple/verify/', {
        receipt_data: receiptData,
        product_id: sku,
        transaction_id: transactionId,
        original_transaction_id: originalTransactionId,
      });

      // 4. Finish transaction in StoreKit (Acknowledges receipt to Apple)
      try {
        await RNIap.finishTransaction({
          purchase: purchase as any,
          isConsumable: false,
        });
      } catch (finishErr: any) {
        console.warn('[AppleIAPService] finishTransaction warning:', finishErr?.message || finishErr);
      }

      return {
        success: true,
        plan: verifyRes?.plan || planSlug,
        billingCycle: verifyRes?.billing_cycle || billingPeriod,
        status: verifyRes?.status || 'ACTIVE',
        message: verifyRes?.message || 'Subscription successfully activated!',
      };
    } catch (err: any) {
      // Check for user cancellation
      if (
        err?.code === 'E_USER_CANCELLED' ||
        err?.code === 'user-cancelled' ||
        err?.message?.includes?.('User canceled') ||
        err?.message?.includes?.('user-cancelled') ||
        err?.message?.includes?.('cancelled') ||
        err?.message?.includes?.('canceled')
      ) {
        return { success: false, error: 'USER_CANCELLED' };
      }

      console.error('[AppleIAPService] purchasePlanSubscription error:', err);
      return {
        success: false,
        error: err?.response?.data?.error || err?.message || 'Purchase verification failed.',
      };
    }
  }

  /**
   * Restores existing purchases for the logged-in user.
   */
  async restorePurchases(): Promise<VerificationResult> {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Restore purchases is only available on iOS.' };
    }

    try {
      const initialized = await this.init();
      if (!initialized) {
        return { success: false, error: 'Could not connect to Apple App Store.' };
      }

      // Sync restore with Apple StoreKit if available
      try {
        if (typeof (RNIap as any).restorePurchases === 'function') {
          await (RNIap as any).restorePurchases();
        }
      } catch (restoreErr) {
        console.warn('[AppleIAPService] native restorePurchases warning:', restoreErr);
      }

      // Fetch existing purchases from Apple
      const purchases = await RNIap.getAvailablePurchases();

      let receiptData: string = '';
      try {
        if (typeof (RNIap as any).getReceiptDataIOS === 'function') {
          receiptData = await (RNIap as any).getReceiptDataIOS();
        }
      } catch (rErr) {
        console.warn('[AppleIAPService] restore getReceiptDataIOS warning:', rErr);
      }

      const transactionsPayload = (purchases || []).map((p: any) => ({
        product_id: p.productId || p.id,
        transaction_id: p.transactionId || p.id,
        original_transaction_id:
          p.originalTransactionIdentifierIOS || p.originalTransactionId || p.transactionId || p.id,
        receipt: p.transactionReceipt || p.purchaseToken || receiptData,
      }));

      if (!receiptData && purchases && purchases.length > 0) {
        receiptData = (purchases[0] as any)?.transactionReceipt || (purchases[0] as any)?.purchaseToken || '';
      }

      // Let backend verify and restore entitlement
      const restoreRes = await apiClient.post<any>('/api/payments/apple/restore/', {
        transactions: transactionsPayload,
        receipt_data: receiptData,
      });

      // Finish any pending purchases
      for (const p of purchases || []) {
        try {
          await RNIap.finishTransaction({ purchase: p as any, isConsumable: false });
        } catch {}
      }

      if (restoreRes?.restored) {
        return {
          success: true,
          plan: restoreRes?.plan,
          billingCycle: restoreRes?.billing_cycle,
          status: restoreRes?.status,
          message: restoreRes?.message || 'Subscription successfully restored!',
        };
      } else {
        return {
          success: false,
          error: restoreRes?.message || 'No active Apple subscriptions were found to restore.',
        };
      }
    } catch (err: any) {
      console.error('[AppleIAPService] restorePurchases error:', err);
      return {
        success: false,
        error: err?.response?.data?.error || err?.message || 'Failed to restore purchases.',
      };
    }
  }
}

export const iapService = new AppleIAPService();
