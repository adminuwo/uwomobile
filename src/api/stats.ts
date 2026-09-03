import { apiClient } from './client';

export interface ClientStats {
  totalConversations: number;
  automationRuns: number;
  activeUsers: number;
  avgResponse: string;
  resourceCounts: {
    connectors: number;
    projects: number;
    teamMembers: number;
    pdfs: number;
    products: number;
  };
}

export interface MonitoringStats {
  active_conversations: number;
  replying_employees: number;
  avg_response_time: string;
  longest_waiting_time: string;
  unread_conversations: number;
  assigned_chats: number;
  resolved_today: number;
  total_conversations: number;
}

export const statsApi = {
  /**
   * Fetch global client stats (counts of contacts, workflows, etc.)
   */
  async getClientStats(): Promise<ClientStats> {
    return apiClient.get<ClientStats>('/api/client/stats/');
  },

  /**
   * Fetch live monitoring stats for inbox
   */
  async getMonitoringStats(): Promise<MonitoringStats> {
    return apiClient.get<MonitoringStats>('/api/monitoring/stats/');
  }
};
