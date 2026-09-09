import { apiClient } from './client';

export type ThemeMode = 'light' | 'dark' | 'custom';

export interface UserPreferences {
  id?: string;
  theme_mode: ThemeMode;
  primary_color: string;
  accent_color: string;
  language: string;
  updated_at?: string;
}

export const preferencesApi = {
  getPreferences: async (): Promise<UserPreferences> => {
    return await apiClient.get<UserPreferences>('/api/user/preferences/');
  },

  updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    return await apiClient.patch<UserPreferences>('/api/user/preferences/', data);
  },
};
