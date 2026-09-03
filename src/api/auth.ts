import { apiClient } from './client';
import { LoginCredentials, LoginResponse, UserProfile } from '../types/auth';

export const authApi = {
  /**
   * Consumes existing Django endpoint `/api/auth/login`
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Consumes existing Django endpoint `/api/profile`
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/api/profile');
  },
};
