import { apiClient } from './client';

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: string;
    buttons?: Array<{ type: string; text: string }>;
  }>;
  variables?: string[];
  created_at?: string;
}

export const templatesApi = {
  /**
   * Fetch approved Meta WhatsApp templates for the client
   */
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await apiClient.get<any>('/api/templates/');
      return Array.isArray(response) ? response : response.results || [];
    } catch {
      return [];
    }
  },

  /**
   * Send WhatsApp Meta Template message to a contact
   */
  async sendTemplateMessage(payload: {
    contact_id?: string;
    phone_number?: string;
    template_name: string;
    language_code?: string;
    variables?: Record<string, string>;
  }): Promise<any> {
    return apiClient.post('/api/messages/', {
      ...payload,
      message_type: 'OUTGOING',
      channel: 'WHATSAPP',
      is_template: true,
    });
  },
};
