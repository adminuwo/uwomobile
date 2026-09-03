import { apiClient } from './client';

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  method: string;
  created_at: string;
  order_id?: string;
  receipt?: string;
}

export interface WalletDashboard {
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN';
  low_balance_threshold: number;
  recent_transactions: PaymentTransaction[];
}

export const paymentsApi = {
  async getPaymentHistory(): Promise<PaymentTransaction[]> {
    const res = await apiClient.get<any>('/api/payments/history/');
    return res.orders || (Array.isArray(res) ? res : []);
  },

  async getWalletDashboard(): Promise<WalletDashboard> {
    return apiClient.get<WalletDashboard>('/api/wallet/dashboard/');
  }
};
