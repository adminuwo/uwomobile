import { apiClient } from './client';

export interface PaymentTransaction {
  id: string;
  transaction_id?: string;
  amount?: number;
  amount_inr?: number;
  currency?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | string;
  type?: string;
  method?: string;
  service_category?: string;
  description?: string;
  created_at: string;
  order_id?: string;
  reference_id?: string;
}

export interface WalletDashboard {
  balance: number;
  balance_paise?: number;
  wallet_balance_inr?: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | string;
  low_balance_threshold: number;
  recent_transactions?: PaymentTransaction[];
  transactions?: PaymentTransaction[];
}

export const paymentsApi = {
  async getPaymentHistory(): Promise<PaymentTransaction[]> {
    const res = await apiClient.get<any>('/api/payments/history/');
    return res.orders || (Array.isArray(res) ? res : []);
  },

  async getWalletDashboard(): Promise<WalletDashboard> {
    const res = await apiClient.get<any>('/api/wallet/dashboard/');
    return {
      balance: res.wallet_balance_inr ?? res.balance ?? 0,
      currency: res.currency || 'INR',
      status: res.status || 'ACTIVE',
      low_balance_threshold: res.low_balance_threshold || 500,
      recent_transactions: res.transactions || res.recent_transactions || [],
    };
  },

  async createRechargeOrder(amount: number): Promise<{ order_id: string; amount: number; currency: string; razorpay_key_id?: string }> {
    return apiClient.post<{ order_id: string; amount: number; currency: string; razorpay_key_id?: string }>('/api/wallet/recharge/create/', { amount });
  },

  async verifyRechargeOrder(data: { order_id: string; razorpay_payment_id?: string; razorpay_signature?: string; force_mock_success?: boolean }): Promise<any> {
    return apiClient.post<any>('/api/wallet/recharge/verify/', data);
  },
};
