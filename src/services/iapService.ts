import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
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
  private productCache: Map<string, RNIap.Subscription> = new Map();

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
      console.warn('[AppleIAPService] initConnection failed:', err?.message || err);
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
  async getSubscriptions(): Promise<Map<string, RNIap.Subscription>> {
    if (Platform.OS !== 'ios') {
      return this.productCache;
    }

    try {
      const initialized = await this.init();
      if (!initialized) return this.productCache;

      const subscriptions = await RNIap.getSubscriptions({
        skus: ALL_APPLE_SUBSCRIPTION_SKUS,
      });

      this.productCache.clear();
      for (const sub of subscriptions) {
        this.productCache.set(sub.productId, sub);
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
  getCachedProduct(planSlug: string, billingPeriod: 'monthly' | 'yearly'): RNIap.Subscription | undefined {
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
      const purchaseResult = await RNIap.requestSubscription({
        sku,
      });

      if (!purchaseResult) {
        return { success: false, error: 'Purchase was not completed.' };
      }

      const purchase = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;
      if (!purchase) {
        return { success: false, error: 'Empty transaction returned by Apple StoreKit.' };
      }

      // 2. Extract transaction details
      const receiptData = purchase.transactionReceipt;
      const transactionId = purchase.transactionId;
      const originalTransactionId = (purchase as any).originalTransactionIdentifierIOS || transactionId;

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
        err?.message?.includes?.('User canceled') ||
        err?.message?.includes?.('cancelled')
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

      // Fetch existing purchases from Apple
      const purchases = await RNIap.getAvailablePurchases();

      const transactionsPayload = purchases.map((p) => ({
        product_id: p.productId,
        transaction_id: p.transactionId,
        original_transaction_id: (p as any).originalTransactionIdentifierIOS || p.transactionId,
        receipt: p.transactionReceipt,
      }));

      // Let backend verify and restore entitlement
      const restoreRes = await apiClient.post<any>('/api/payments/apple/restore/', {
        transactions: transactionsPayload,
        receipt_data: purchases[0]?.transactionReceipt,
      });

      // Finish any pending purchases
      for (const p of purchases) {
        try {
          await RNIap.finishTransaction({ purchase: p, isConsumable: false });
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
