import { client } from './client';

export type LeadStage = 'NEW' | 'QUALIFIED' | 'HOT_LEAD' | 'FOLLOWUP' | 'NEGOTIATION' | 'WON' | 'LOST';
export type FollowUpType = 'CALL' | 'MESSAGE' | 'MEETING' | 'EMAIL' | 'OTHER';
export type FollowUpStatus = 'PENDING' | 'DONE' | 'CANCELLED';

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
  follow_ups_count?: number;
  next_followup_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ContactFollowUp {
  id: string;
  contact: string;
  client: string;
  created_by?: string;
  created_by_name?: string;
  follow_up_type: FollowUpType;
  title: string;
  note?: string;
  scheduled_at: string;
  completed_at?: string | null;
  status: FollowUpStatus;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  // Enriched fields from upcoming_followups endpoint
  contact_name?: string;
  contact_phone?: string;
  contact_stage?: LeadStage;
}

export interface CreateFollowUpPayload {
  follow_up_type: FollowUpType;
  title: string;
  note?: string;
  scheduled_at: string; // ISO string
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
  // ─── Contacts ───────────────────────────────────────────────
  getContacts: async (params: FetchContactsParams = {}): Promise<Contact[]> => {
    const { search = '', stage, limit = 100, offset = 0 } = params;
    const queryParams: Record<string, any> = { limit, offset };
    if (search) queryParams.search = search;
    if (stage) queryParams.stage = stage;

    try {
      const res = await client.get<any>('/api/contacts/', { params: queryParams });
      const rawList: Contact[] = Array.isArray(res) ? res : (res?.results || []);
      return rawList;
    } catch (error: any) {
      if (error?.status !== 401 && error?.code !== 'HTTP_401') {
        console.warn('[crmApi.getContacts] Warning:', error?.message || error);
      }
      return [];
    }
  },

  getContactById: async (id: string): Promise<Contact | null> => {
    try {
      const res = await client.get<Contact>(`/api/contacts/${id}/`);
      return res;
    } catch (error: any) {
      if (error?.status !== 401 && error?.code !== 'HTTP_401') {
        console.warn(`[crmApi.getContactById] Warning ${id}:`, error?.message || error);
      }
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

  // ─── Follow-Ups ─────────────────────────────────────────────
  getFollowUps: async (contactId: string): Promise<ContactFollowUp[]> => {
    try {
      const res = await client.get<any>(`/api/contacts/${contactId}/follow_ups/`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  createFollowUp: async (contactId: string, payload: CreateFollowUpPayload): Promise<ContactFollowUp> => {
    const res = await client.post<ContactFollowUp>(`/api/contacts/${contactId}/follow_ups/create/`, payload);
    return res;
  },

  updateFollowUp: async (
    contactId: string,
    followUpId: string,
    data: { status?: FollowUpStatus; note?: string }
  ): Promise<ContactFollowUp> => {
    const res = await client.patch<ContactFollowUp>(
      `/api/contacts/${contactId}/follow_ups/${followUpId}/update/`,
      data
    );
    return res;
  },

  getUpcomingFollowUps: async (): Promise<ContactFollowUp[]> => {
    try {
      const res = await client.get<any>('/api/contacts/upcoming_followups/');
      return Array.isArray(res) ? res : [];
    } catch (error: any) {
      // Fallback: If endpoint is 404 (e.g. cloud server deploying), derive from existing FOLLOWUP contacts
      if (error?.status === 404 || error?.code === 'HTTP_404') {
        try {
          const contactsRes = await client.get<any>('/api/contacts/?page_size=20');
          const contacts: Contact[] = Array.isArray(contactsRes)
            ? contactsRes
            : contactsRes?.results || [];

          return contacts
            .filter((c) => c.stage === 'FOLLOWUP' || c.stage === 'HOT_LEAD')
            .map((c) => ({
              id: `fu-${c.id}`,
              contact: c.id,
              client: '',
              follow_up_type: (c.stage === 'HOT_LEAD' ? 'CALL' : 'MESSAGE') as FollowUpType,
              title: c.stage === 'HOT_LEAD' ? '🔥 Hot Lead Follow-Up' : 'Scheduled Follow-Up',
              scheduled_at: c.updated_at || c.created_at || new Date().toISOString(),
              status: 'PENDING' as FollowUpStatus,
              is_overdue: false,
              created_at: c.created_at,
              updated_at: c.updated_at || c.created_at,
              contact_name: c.name || c.phone_number || 'Lead',
              contact_phone: c.phone_number || '',
              contact_stage: c.stage,
            }));
        } catch {
          return [];
        }
      }
      return [];
    }
  },
};
