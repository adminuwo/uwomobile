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
  whatsapp_message_id?: string;
  status?: string;
  media_url?: string | null;
  media_type?: string | null; // 'image' | 'document' | 'video' | 'audio'
  media_filename?: string | null;
  media_mime_type?: string | null;
  buttons?: string[] | any[];
  metadata?: any;
  created_at: string;
}

export interface SendMessagePayload {
  to_number: string;
  body: string;
  channel: string;
  message_type?: 'OUTGOING' | 'INTERNAL';
  file?: {
    uri: string;
    name: string;
    type?: string;
  } | null;
}

export interface FetchConversationsParams {
  channel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FetchMessagesParams {
  contactId: string;
  channel?: string;
  limit?: number;
  offset?: number;
}

export const resolveChannel = (
  rawChannel?: string,
  name?: string,
  platformId?: string,
  email?: string
): string => {
  const ch = (rawChannel || '').toUpperCase().trim();
  const n = (name || '').toUpperCase();
  const pid = String(platformId || '').toLowerCase();
  const em = String(email || '').toLowerCase();

  if (ch && ch !== 'WHATSAPP' && ch !== 'ALL') {
    return ch;
  }

  if (pid.includes('@') || em.includes('@')) {
    return 'GMAIL';
  }

  if (
    n.includes('INSTAGRAM') ||
    n.includes('INSTA') ||
    n.includes('REEL') ||
    n.startsWith('@') ||
    pid.includes('instagram') ||
    pid.startsWith('ig_')
  ) {
    return 'INSTAGRAM';
  }
  if (n.includes('FACEBOOK') || n.includes('FB_') || pid.includes('facebook') || pid.startsWith('fb_')) {
    return 'FACEBOOK';
  }
  if (n.includes('YOUTUBE') || n.includes('YT_') || pid.includes('youtube') || pid.startsWith('yt_')) {
    return 'YOUTUBE';
  }

  return ch || 'WHATSAPP';
};

export const formatDisplayName = (name?: string, phone?: string, platformId?: string): string => {
  const isHexObjectId = (str?: string) => !!str && /^[0-9a-fA-F]{24}$/.test(str.trim());
  const isGeneric = (str?: string) => {
    if (!str) return true;
    const s = str.trim().toUpperCase();
    return ['UNKNOWN', 'UNKNOWN USER', 'USER', 'CUSTOMER', 'NONE', 'NULL', 'UNDEFINED'].includes(s);
  };

  // 1. Clean name
  let cleanName = (name || '').trim();
  if (isHexObjectId(cleanName) || isGeneric(cleanName)) {
    cleanName = '';
  }

  // 2. Clean phone & platformId
  let cleanPhone = (phone || '').trim();
  if (isHexObjectId(cleanPhone) || isGeneric(cleanPhone)) {
    cleanPhone = '';
  }

  let cleanPlatform = (platformId || '').trim();
  if (isHexObjectId(cleanPlatform) || isGeneric(cleanPlatform)) {
    cleanPlatform = '';
  }

  // Check if a string is purely numeric phone digits
  const isNumericPhone = (s: string) => /^\+?\d{7,15}$/.test(s.replace(/[\s\-\(\)]/g, ''));

  // If saved contact name exists and is not purely numbers, return it
  if (cleanName && !isNumericPhone(cleanName)) {
    return cleanName;
  }

  // Otherwise, display clean formatted phone number
  const candidate = cleanPhone || (isNumericPhone(cleanName) ? cleanName : '') || cleanPlatform;
  if (candidate) {
    const raw = candidate.trim();
    const digits = raw.replace(/\D/g, '');

    // India (+91)
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    // US/Canada (+1)
    else if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    // UK (+44)
    else if (digits.length >= 11 && digits.length <= 13 && digits.startsWith('44')) {
      return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }
    // Generic international format
    else if (digits.length >= 7 && digits.length <= 15) {
      return raw.startsWith('+') ? raw : `+${digits}`;
    }

    if (!isHexObjectId(raw)) {
      return raw;
    }
  }

  return cleanName || 'Customer';
};

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
      const rawConvos = Array.isArray(res) ? res : (res?.results || []);

      const formatted: Conversation[] = rawConvos.map((c: any) => {
        const rawAddr = c.contact_platform_id || c.contact_phone || c.id;
        const nameStr = formatDisplayName(c.contact_name, c.contact_phone, c.contact_platform_id);
        const dynamicChannel = resolveChannel(c.channel || c.preferred_channel, nameStr, rawAddr, c.contact_email);

        return {
          id: String(c.id || rawAddr),
          name: nameStr,
          rawAddress: String(rawAddr),
          lastMessage: c.last_message_summary || 'Recent conversation',
          time: c.last_message_at || c.updated_at || c.created_at || new Date().toISOString(),
          unread: c.unread_count_admin || c.unread_count_employee || 0,
          channel: dynamicChannel,
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
            email: c.contact_email,
          },
        };
      });

      return {
        conversations: formatted,
        hasMore: rawConvos.length >= limit,
      };
    } catch (error: any) {
      if (error?.status !== 401 && error?.code !== 'HTTP_401') {
        console.warn('[inboxApi.getConversations] Warning:', error?.message || error);
      }
      return { conversations: [], hasMore: false };
    }

  },

  getMessages: async (params: FetchMessagesParams): Promise<{ messages: Message[]; hasMore: boolean }> => {
    const { contactId, channel, limit = 50, offset = 0 } = params;
    if (!contactId) return { messages: [], hasMore: false };

    const queryParams: Record<string, any> = {
      contact_id: contactId,
      limit,
      offset,
    };
    if (channel && channel !== 'ALL') {
      queryParams.channel = channel;
    }

    try {
      const res = await client.get<any>('/api/messages/', {
        params: queryParams,
      });

      const rawList: Message[] = Array.isArray(res) ? res : (res?.results || []);
      const fetchedMessages = [...rawList].reverse();

      return {
        messages: fetchedMessages,
        hasMore: rawList.length >= limit,
      };
    } catch (error: any) {
      if (error?.status !== 401 && error?.code !== 'HTTP_401') {
        console.warn('[inboxApi.getMessages] Warning:', error?.message || error);
      }
      return { messages: [], hasMore: false };
    }

  },

  sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
    if (payload.file) {
      const formData = new FormData();
      formData.append('to_number', payload.to_number);
      formData.append('body', payload.body || `📄 ${payload.file.name}`);
      formData.append('channel', payload.channel);
      if (payload.message_type) {
        formData.append('message_type', payload.message_type);
      }
      formData.append('file', {
        uri: payload.file.uri,
        name: payload.file.name,
        type: payload.file.type || 'application/pdf',
      } as any);

      const res = await client.post<Message>('/api/messages/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res;
    }

    const res = await client.post<Message>('/api/messages/', payload);
    return res;
  },

  takeoverConversation: async (convoId: string): Promise<any> => {
    return client.post(`/api/conversations/${convoId}/takeover/`, {});
  },

  resumeBot: async (convoId: string): Promise<any> => {
    return client.post(`/api/conversations/${convoId}/resume_bot/`, {});
  },

  transferConversation: async (convoId: string, payload: { agent_id?: string; department?: string; note?: string }): Promise<any> => {
    return client.post(`/api/conversations/${convoId}/transfer/`, payload);
  },

  getAuditLogs: async (convoId: string): Promise<any> => {
    return client.get(`/api/conversations/${convoId}/audit_logs/`);
  },

  markAsRead: async (convoId: string): Promise<any> => {
    return client.post(`/api/conversations/${convoId}/mark_read/`, {}).catch(() => null);
  },
};
