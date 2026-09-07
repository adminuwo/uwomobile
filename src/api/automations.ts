import { apiClient } from './client';

export interface AutomationRule {
  id: string;
  name: string;
  trigger_type: 'KEYWORD' | 'START_CHAT';
  keywords: string[];
  response: string;
  buttons?: string[];
  channels?: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationsResponse {
  count?: number;
  results?: AutomationRule[];
}

export const automationsApi = {
  async getAutomations(): Promise<AutomationRule[]> {
    const res = await apiClient.get<any>('/api/automations/');
    if (Array.isArray(res)) return res;
    if (res?.results) return res.results;
    return [];
  },

  async createAutomation(data: Partial<AutomationRule>): Promise<AutomationRule> {
    return apiClient.post<AutomationRule>('/api/automations/', data);
  },

  async updateAutomation(id: string, data: Partial<AutomationRule>): Promise<AutomationRule> {
    return apiClient.patch<AutomationRule>(`/api/automations/${id}/`, data);
  },

  async deleteAutomation(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/automations/${id}/`);
  },
};
