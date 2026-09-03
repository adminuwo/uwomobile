import { salesDocumentsApi, SalesDocumentsResponse, SalesDocument } from './salesDocuments';

export const quotationsApi = {
  getQuotations: (params?: { limit?: number; offset?: number; search?: string }): Promise<SalesDocumentsResponse> => {
    return salesDocumentsApi.getDocuments({ ...params, document_type: 'QUOTATION' });
  },
  getQuotation: (id: string): Promise<SalesDocument> => {
    return salesDocumentsApi.getDocument(id);
  },
  createQuotation: (data: Partial<SalesDocument>): Promise<SalesDocument> => {
    return salesDocumentsApi.createDocument({ ...data, document_type: 'QUOTATION' });
  },
};
