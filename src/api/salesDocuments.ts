import { apiClient } from './client';

export type DocumentType = 'QUOTATION' | 'PROPOSAL' | 'INVOICE';
export type DocumentStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'PAID' | 'OVERDUE';

export interface SalesDocumentItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate?: number;
  total?: number;
}

export interface SalesDocument {
  id: string;
  document_number: string;
  document_type: DocumentType;
  status: DocumentStatus;
  customer: string;
  customer_name?: string;
  currency?: string;
  issue_date: string;
  expiry_date?: string;
  due_date?: string;
  items: SalesDocumentItem[];
  subtotal: number;
  total_tax: number;
  total_discount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesDocumentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SalesDocument[];
}

export const salesDocumentsApi = {
  async getDocuments(params?: { 
    limit?: number; 
    offset?: number; 
    search?: string; 
    document_type?: string 
  }): Promise<SalesDocumentsResponse> {
    return apiClient.get<SalesDocumentsResponse>('/api/sales-documents/', { params });
  },
  
  async getDocument(id: string): Promise<SalesDocument> {
    return apiClient.get<SalesDocument>(`/api/sales-documents/${id}/`);
  },

  async createDocument(data: Partial<SalesDocument>): Promise<SalesDocument> {
    return apiClient.post<SalesDocument>('/api/sales-documents/', data);
  },

  async updateDocument(id: string, data: Partial<SalesDocument>): Promise<SalesDocument> {
    return apiClient.patch<SalesDocument>(`/api/sales-documents/${id}/`, data);
  },

  async deleteDocument(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/sales-documents/${id}/`);
  },

  async convertToInvoice(id: string): Promise<SalesDocument> {
    return apiClient.post<SalesDocument>(`/api/sales-documents/${id}/convert_invoice/`);
  },

  async sendDocument(id: string, data: { channels: string[]; customMessage: string }): Promise<void> {
    return apiClient.post<void>(`/api/sales-documents/${id}/send/`, data);
  }
};
