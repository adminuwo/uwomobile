import { salesDocumentsApi, SalesDocumentsResponse, SalesDocument } from './salesDocuments';

export const invoicesApi = {
  getInvoices: (params?: { limit?: number; offset?: number; search?: string }): Promise<SalesDocumentsResponse> => {
    return salesDocumentsApi.getDocuments({ ...params, document_type: 'INVOICE' });
  },
  getInvoice: (id: string): Promise<SalesDocument> => {
    return salesDocumentsApi.getDocument(id);
  },
  createInvoice: (data: Partial<SalesDocument>): Promise<SalesDocument> => {
    return salesDocumentsApi.createDocument({ ...data, document_type: 'INVOICE' });
  },
};
