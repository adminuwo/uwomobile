import { client } from './client';

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'scheduled' | 'trash' | 'spam' | 'archive';
export type EmailProvider = 'gmail' | 'outlook';

export interface EmailMessage {
  id: string;
  folder: EmailFolder;
  provider: EmailProvider;
  sender_name: string;
  sender_email: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  is_read: boolean;
  is_starred: boolean;
  has_attachment: boolean;
  attachment_name?: string | null;
  has_meeting: boolean;
  meeting_info?: {
    title?: string;
    meeting_link?: string;
    date?: string;
    time?: string;
  } | null;
  scheduled_info?: string | null;
  created_full?: string;
}

export interface FolderCounts {
  inbox: number;
  sent: number;
  drafts: number;
  scheduled: number;
  trash: number;
  spam: number;
  archive: number;
}

export interface ComposeEmailPayload {
  action: 'send' | 'draft' | 'schedule';
  provider: EmailProvider | string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface AutoReplyPayload {
  name: string;
  reply_type?: string;
  reply_subject: string;
  reply_body: string;
  is_active?: boolean;
}

/**
 * Strips conversational filler, LLM intro preambles, and closing chatter
 * so that ONLY the direct email body is returned.
 */
export function cleanAiEmailContent(rawText: string): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // 1. Remove introductory/preamble lines ending with a colon or newline
  text = text.replace(
    /^(?:certainly!?|sure!?|of course!?|here(?:['’]s| is| are)|below is|i have|as requested)[\s\S]*?(?::|\n\n+)/i,
    ''
  );

  // 2. Remove trailing conversational closings
  text = text.replace(
    /(?:\r?\n)+(?:feel free to|hope this helps|let me know if|please let me know|don't hesitate to|if you need any|i hope this|any questions)[\s\S]*$/i,
    ''
  );

  text = text.trim();

  // 3. Repeatedly clean markdown code blocks, dividers (-, ---, ***), bullets, and quotes
  let changed = true;
  while (changed) {
    const prev = text;

    // Remove markdown code block fences
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Remove leading divider lines or bullets (e.g. "-", "---", "***", "___", "•")
    text = text.replace(/^[-–—_*~•#\s]+(?:\r?\n)+/, '').trim();
    text = text.replace(/^[-–—•]\s+/, '').trim();
    if (text.startsWith('-') || text.startsWith('–') || text.startsWith('—')) {
      text = text.replace(/^[-–—_*~•\s]+/, '').trim();
    }

    // Remove trailing divider lines or bullets (e.g. "-", "---", "***", "___")
    text = text.replace(/(?:\r?\n)+[-–—_*~•#\s]+$/, '').trim();
    if (text.endsWith('-') || text.endsWith('–') || text.endsWith('—')) {
      text = text.replace(/[-–—_*~•\s]+$/, '').trim();
    }

    // Remove enclosing quotation marks
    if (
      (text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith('“') && text.endsWith('”')) ||
      (text.startsWith("'") && text.endsWith("'")) ||
      (text.startsWith('‘') && text.endsWith('’'))
    ) {
      text = text.slice(1, -1).trim();
    }

    changed = text !== prev;
  }

  return text;
}

export const emailApi = {
  getEmails: async (params: {
    folder?: string;
    provider?: string;
    search?: string;
    limit?: number;
    offset?: number;
    skip_sync?: boolean;
  }): Promise<{ messages: EmailMessage[]; folder_counts: FolderCounts }> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.folder) searchParams.append('folder', params.folder);
      if (params.provider) searchParams.append('provider', params.provider);
      if (params.search) searchParams.append('search', params.search);
      searchParams.append('limit', String(params.limit || 20));
      searchParams.append('offset', String(params.offset || 0));
      searchParams.append('skip_sync', params.skip_sync ? 'true' : 'false');

      const res = await client.get<any>(`/api/email/messages/?${searchParams.toString()}`);
      const rawMessages = res?.messages?.results || res?.messages || res?.results || (Array.isArray(res) ? res : []);

      const formatted: EmailMessage[] = rawMessages.map((msg: any) => ({
        id: String(msg.id),
        folder: (msg.folder || 'inbox') as EmailFolder,
        provider: (msg.account_provider || params.provider || 'gmail') as EmailProvider,
        sender_name: msg.sender_name || msg.sender_email?.split('@')[0] || 'Unknown',
        sender_email: msg.sender_email || '',
        to: msg.to_recipients && msg.to_recipients.length > 0 ? msg.to_recipients[0] : (msg.to || ''),
        subject: msg.subject || '(No Subject)',
        preview: (msg.body_text || msg.body || '').substring(0, 120),
        body: msg.body_text || msg.body_html || msg.body || '',
        time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        date: msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '',
        is_read: msg.is_read ?? true,
        is_starred: msg.is_starred ?? false,
        has_attachment: (msg.attachments && msg.attachments.length > 0) || false,
        attachment_name: msg.attachments?.[0]?.name || null,
        has_meeting: Boolean(msg.meeting_invite_data && msg.meeting_invite_data.title),
        meeting_info: msg.meeting_invite_data || null,
        scheduled_info: msg.metadata?.scheduled_date ? `${msg.metadata.scheduled_date} at ${msg.metadata.scheduled_time}` : null,
        created_full: msg.created_at ? new Date(msg.created_at).toLocaleString() : '',
      }));

      const defaultCounts: FolderCounts = {
        inbox: 0,
        sent: 0,
        drafts: 0,
        scheduled: 0,
        trash: 0,
        spam: 0,
        archive: 0,
      };

      return {
        messages: formatted,
        folder_counts: { ...defaultCounts, ...(res?.folder_counts || {}) },
      };
    } catch (err) {
      console.log('[emailApi.getEmails] Notice:', err);
      return {
        messages: [],
        folder_counts: { inbox: 0, sent: 0, drafts: 0, scheduled: 0, trash: 0, spam: 0, archive: 0 },
      };
    }
  },

  composeEmail: async (payload: ComposeEmailPayload): Promise<any> => {
    return client.post('/api/email/compose/', payload);
  },

  toggleStar: async (id: string): Promise<any> => {
    return client.post(`/api/email/messages/${id}/toggle_star/`);
  },

  markRead: async (id: string, is_read = true): Promise<any> => {
    return client.post(`/api/email/messages/${id}/mark_read/`, { is_read });
  },

  deleteEmail: async (id: string): Promise<any> => {
    return client.post(`/api/email/messages/${id}/delete_message/`);
  },

  saveAutoReply: async (payload: AutoReplyPayload): Promise<any> => {
    return client.post('/api/email/auto-replies/', payload);
  },

  aiPolish: async (prompt: string, tone?: string): Promise<string> => {
    try {
      const res = await client.post<any>('/api/campaigns/ai_generate/', {
        prompt: prompt || 'Professional business reply',
        action_type: 'improve',
        tone: tone || 'professional',
      });
      const rawText = res?.result || res?.content || '';
      return cleanAiEmailContent(rawText);
    } catch {
      return `Dear Client,\n\n${prompt.trim()}\n\nBest regards,\nUWOConnect Team`;
    }
  },
};
