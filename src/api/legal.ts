import { apiClient } from './client';

export interface ConsentStatusResponse {
  requires_consent: boolean;
  terms: {
    current_version: string;
    accepted_version: string;
    is_accepted: boolean;
    accepted_at: string | null;
  };
  privacy_policy: {
    current_version: string;
    accepted_version: string;
    is_accepted: boolean;
    accepted_at: string | null;
  };
}

export interface LegalDocumentsResponse {
  terms: {
    id?: string;
    document_type: string;
    title: string;
    version: string;
    effective_date: string;
    summary: string;
    content: string;
    requires_reconsent: boolean;
  };
  privacy_policy: {
    id?: string;
    document_type: string;
    title: string;
    version: string;
    effective_date: string;
    summary: string;
    content: string;
    requires_reconsent: boolean;
  };
}

export interface SubmitConsentPayload {
  terms_accepted: boolean;
  terms_version: string;
  privacy_accepted: boolean;
  privacy_version: string;
}

export interface AccountDeletionPayload {
  confirmation: string;
  password?: string;
}

export const legalApi = {
  /**
   * Fetches active versions of Terms & Conditions and Privacy Policy
   * Public endpoint (no auth required)
   */
  async getDocuments(): Promise<LegalDocumentsResponse> {
    return apiClient.get<LegalDocumentsResponse>('/api/legal/documents/');
  },

  /**
   * Checks if current user needs to review/accept updated terms or privacy
   */
  async getConsentStatus(): Promise<ConsentStatusResponse> {
    return apiClient.get<ConsentStatusResponse>('/api/legal/consent-status/');
  },

  /**
   * Records explicit consent acceptance
   */
  async submitConsent(payload: SubmitConsentPayload): Promise<{ status: string; message: string }> {
    return apiClient.post('/api/legal/consent/', payload);
  },

  /**
   * Triggers account deletion workflow
   */
  async deleteAccount(payload: AccountDeletionPayload): Promise<{ status: string; message: string }> {
    return apiClient.post('/api/auth/delete-account/', payload);
  },
};
