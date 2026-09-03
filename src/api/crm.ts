import { client } from './client';

export type LeadStage = 'NEW' | 'FOLLOWUP' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Contact {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  platform_id?: string;
  preferred_channel?: string;
  stage: LeadStage;
  tags?: string[];
  notes?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  deal_value?: number;
  created_at: string;
  updated_at?: string;
}

export interface FetchContactsParams {
  search?: string;
  stage?: LeadStage;
  limit?: number;
  offset?: number;
}

export interface CreateContactPayload {
  name: string;
  phone_number?: string;
  email?: string;
  preferred_channel?: string;
  stage?: LeadStage;
  notes?: string;
  tags?: string[];
}

export const crmApi = {
  getContacts: async (params: FetchContactsParams = {}): Promise<Contact[]> => {
    const { search = '', stage, limit = 100, offset = 0 } = params;

    const queryParams: Record<string, any> = { limit, offset };
    if (search) queryParams.search = search;
    if (stage) queryParams.stage = stage;

    try {
      const res = await client.get<any>('/api/contacts/', { params: queryParams });
      const rawList: Contact[] = Array.isArray(res) ? res : (res?.results || []);
      return rawList;
    } catch (error) {
      console.warn('Failed to fetch contacts:', error);
      return [];
    }
  },

  getContactById: async (id: string): Promise<Contact | null> => {
    try {
      const res = await client.get<Contact>(`/api/contacts/${id}/`);
      return res;
    } catch (error) {
      console.warn(`Failed to fetch contact ${id}:`, error);
      return null;
    }
  },

  createContact: async (payload: CreateContactPayload): Promise<Contact> => {
    const res = await client.post<Contact>('/api/contacts/', payload);
    return res;
  },

  updateContactStage: async (id: string, stage: LeadStage): Promise<Contact> => {
    const res = await client.patch<Contact>(`/api/contacts/${id}/`, { stage });
    return res;
  },

  updateContact: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const res = await client.patch<Contact>(`/api/contacts/${id}/`, data);
    return res;
  },
};
