import { apiClient } from './client';
import { LoginCredentials, LoginResponse, UserProfile } from '../types/auth';

export interface QrSessionResponse {
  session_id: string;
  status: string;
  expires_at: string;
  expires_in_seconds: number;
  qr_url: string;
}

export interface QrStatusResponse {
  session_id: string;
  status: string;
  expires_in_seconds: number;
}

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

  /**
   * Creates a short-lived (120s) QR Auth Session for web-to-mobile handoff
   */
  async createQrSession(): Promise<QrSessionResponse> {
    return apiClient.post<QrSessionResponse>('/api/auth/qr/create', {});
  },

  /**
   * Checks status of a QR Auth Session
   */
  async getQrSessionStatus(sessionId: string): Promise<QrStatusResponse> {
    return apiClient.get<QrStatusResponse>(`/api/auth/qr/status/${sessionId}`);
  },

  /**
   * Consumes a QR Auth Session to log in on mobile app
   */
  async consumeQrSession(sessionId: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/qr/consume', { session_id: sessionId });
  },
};
