import { apiClient } from './client';

export interface Invoice {
  id: string;
  token: string;
  invoice_number: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customer_name: string;
  customer_email?: string;
  total_amount: number;
  balance_due: number;
  currency: string;
  issue_date: string;
  due_date: string;
}

export const invoicesApi = {
  async getInvoices(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/api/invoices/');
  },

  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/api/invoices/${id}/`);
  }
};
