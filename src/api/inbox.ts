import { client } from './client';

export interface Conversation {
  id: string;
  name: string;
  rawAddress: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: string;
  assignedTo?: string | null;
  handlerName?: string | null;
  assignedToName?: string | null;
  handlerDept?: string | null;
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedByName?: string | null;
  convoDbId?: string | null;
  status: string;
  contactObj?: {
    platform_id?: string;
    phone_number?: string;
    name?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  from_address: string;
  to_address: string;
  body: string;
  channel: string;
  message_type: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  sender_name?: string;
  sender_avatar?: string;
  sender_department?: string;
  created_at: string;
  status?: string;
}

export interface SendMessagePayload {
  to_number: string;
  body: string;
  channel: string;
  message_type?: 'OUTGOING' | 'INTERNAL';
}

export interface FetchConversationsParams {
  channel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FetchMessagesParams {
  contactId: string;
  limit?: number;
  offset?: number;
}

export const inboxApi = {
  getConversations: async (params: FetchConversationsParams = {}): Promise<{ conversations: Conversation[]; hasMore: boolean }> => {
    const { channel = 'ALL', search = '', limit = 20, offset = 0 } = params;

    const queryParams: Record<string, any> = { limit, offset };
    if (channel && channel !== 'ALL') {
      queryParams.channel = channel;
    }
    if (search) {
      queryParams.search = search;
    }

    try {
      const res = await client.get<any>('/api/conversations/', { params: queryParams });
      let rawConvos = Array.isArray(res) ? res : (res?.results || []);

      // Fallback to contacts if conversations empty on initial load
      if (rawConvos.length === 0 && offset === 0 && !search) {
        const contactRes = await client.get<any>('/api/contacts/', { params: { limit, offset: 0 } }).catch(() => []);
        const rawContacts = Array.isArray(contactRes) ? contactRes : (contactRes?.results || []);
        rawConvos = rawContacts.map((ct: any) => ({
          id: ct.id,
          contact_name: ct.name || ct.phone_number || ct.platform_id || 'Customer',
          contact_platform_id: ct.platform_id || ct.phone_number || ct.id,
          contact_phone: ct.phone_number,
          channel: (ct.preferred_channel || 'WHATSAPP').toUpperCase(),
          last_message_summary: 'Tap to view messages...',
          last_message_at: ct.updated_at || ct.created_at,
          unread_count_admin: 0,
          status: ct.stage || 'OPEN',
        }));
      }

      const formatted: Conversation[] = rawConvos.map((c: any) => {
        const rawAddr = c.contact_platform_id || c.contact_phone || c.id;
        return {
          id: String(c.id || rawAddr),
          name: c.contact_name || c.contact_platform_id || c.contact_phone || 'Customer',
          rawAddress: String(rawAddr),
          lastMessage: c.last_message_summary || 'Recent conversation',
          time: c.last_message_at || c.updated_at || c.created_at || new Date().toISOString(),
          unread: c.unread_count_admin || c.unread_count_employee || 0,
          channel: (c.channel || 'WHATSAPP').toUpperCase(),
          assignedTo: c.assigned_to || null,
          handlerName: c.assigned_to_name || c.locked_by_name || null,
          assignedToName: c.assigned_to_name || c.locked_by_name || null,
          handlerDept: c.assigned_department || 'Support',
          isLocked: c.is_locked || false,
          lockedBy: c.locked_by || null,
          lockedByName: c.locked_by_name || null,
          convoDbId: c.id ? String(c.id) : null,
          status: c.status || 'OPEN',
          contactObj: {
            platform_id: c.contact_platform_id,
            phone_number: c.contact_phone,
            name: c.contact_name,
          },
        };
      });

      return {
        conversations: formatted,
        hasMore: rawConvos.length >= limit,
      };
    } catch (error) {
      console.warn('Failed to fetch conversations:', error);
      return { conversations: [], hasMore: false };
    }
  },

  getMessages: async (params: FetchMessagesParams): Promise<{ messages: Message[]; hasMore: boolean }> => {
    const { contactId, limit = 50, offset = 0 } = params;
    if (!contactId) return { messages: [], hasMore: false };

    try {
      const res = await client.get<any>('/api/messages/', {
        params: {
          contact_id: contactId,
          limit,
          offset,
        },
      });

      const rawList: Message[] = Array.isArray(res) ? res : (res?.results || []);
      const fetchedMessages = [...rawList].reverse();

      return {
        messages: fetchedMessages,
        hasMore: rawList.length >= limit,
      };
    } catch (error) {
      console.warn('Failed to fetch messages:', error);
      return { messages: [], hasMore: false };
    }
  },

  sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
    const res = await client.post<Message>('/api/messages/', payload);
    return res;
  },

  takeoverConversation: async (convoId: string): Promise<any> => {
    return client.post(`/api/conversations/${convoId}/takeover/`, {});
  },
};
