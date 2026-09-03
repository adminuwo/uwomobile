import { apiClient } from './client';

export interface Quotation {
  id: string;
  token: string;
  title: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  customer_name: string;
  customer_email?: string;
  total_amount: number;
  currency: string;
  created_at: string;
  valid_until?: string;
}

export const quotationsApi = {
  async getQuotations(): Promise<Quotation[]> {
    return apiClient.get<Quotation[]>('/api/quotations/');
  },

  async getQuotation(id: string): Promise<Quotation> {
    return apiClient.get<Quotation>(`/api/quotations/${id}/`);
  }
};
