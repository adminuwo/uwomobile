import { apiClient } from './client';

export interface TeamMember {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | string;
  department?: string;
  phone?: string;
  is_active: boolean;
  date_joined?: string;
}

export interface TeamChatMessage {
  id: string;
  sender_name?: string;
  sender_email?: string;
  sender_id?: string;
  body: string;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  token?: string;
  qr_code?: string;
  created_at: string;
  is_used: boolean;
}

export const teamApi = {
  async getMembers(): Promise<TeamMember[]> {
    const res = await apiClient.get<any>('/api/team/members/');
    if (Array.isArray(res)) return res;
    if (res?.results && Array.isArray(res.results)) return res.results;
    return [];
  },

  async getProjects(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/team/projects/');
    if (Array.isArray(res)) return res;
    if (res?.results && Array.isArray(res.results)) return res.results;
    return [];
  },

  async getTasks(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/team/tasks/');
    if (Array.isArray(res)) return res;
    if (res?.results && Array.isArray(res.results)) return res.results;
    return [];
  },

  async createMember(data: { email: string; name?: string; role?: string; department?: string; password?: string }): Promise<any> {
    return apiClient.post('/api/team/members/', data);
  },

  async createTask(data: { title: string; priority?: string; status?: string; department?: string }): Promise<any> {
    return apiClient.post('/api/team/tasks/', data);
  },

  async updateTaskStatus(taskId: string, status: string): Promise<any> {
    return apiClient.patch(`/api/team/tasks/${taskId}/`, { status });
  },

  async createProject(data: { name: string; department?: string; description?: string }): Promise<any> {
    return apiClient.post('/api/team/projects/', data);
  },

  async getChatMessages(): Promise<TeamChatMessage[]> {
    const res = await apiClient.get<any>('/api/team/chat/');
    if (Array.isArray(res)) return res;
    if (res?.results) return res.results;
    return [];
  },

  async sendChatMessage(body: string): Promise<TeamChatMessage> {
    return apiClient.post<TeamChatMessage>('/api/team/chat/', { body });
  },

  async getInvites(): Promise<TeamInvite[]> {
    const res = await apiClient.get<any>('/api/team/invites/');
    if (Array.isArray(res)) return res;
    if (res?.results) return res.results;
    return [];
  },

  async createInvite(data: { email: string; role: string }): Promise<TeamInvite> {
    return apiClient.post<TeamInvite>('/api/team/invites/', data);
  },

  async generateQrInvite(): Promise<{ qr_url?: string; invite_link?: string; token: string }> {
    return apiClient.post<any>('/api/team/invites/generate-qr/', {});
  },
};
