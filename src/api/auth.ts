import { apiClient } from './client';
import { LoginCredentials, LoginResponse, UserProfile, RegisterPayload } from '../types/auth';

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
   * Consumes existing Django endpoint `/api/auth/register`
   */
  async register(data: RegisterPayload): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/register', data);
  },

  /**
   * Consumes existing Django endpoint `/api/auth/login`
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Consumes Django Google OAuth endpoint `/api/auth/google/`
   */
  async loginWithGoogle(idToken: string, extra?: { name?: string; invite_token?: string }): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/google/', {
      id_token: idToken,
      ...extra,
    });
  },

  /**
   * Consumes Django Apple Sign-In endpoint `/api/auth/apple/`
   */
  async loginWithApple(identityToken: string, extra?: { name?: string; invite_token?: string }): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/apple/', {
      identity_token: identityToken,
      ...extra,
    });
  },

  /**
   * Consumes existing Django endpoint `/api/profile`
   */
  async getProfile(overrideToken?: string): Promise<UserProfile> {
    const config = overrideToken ? { headers: { Authorization: `Bearer ${overrideToken}` } } : undefined;
    return apiClient.get<UserProfile>('/api/profile', config);
  },

  /**
   * Update User / Client profile on `/api/profile`
   */
  async updateProfile(data: Record<string, any>): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/api/profile', data);
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

  /**
   * Request a 6-digit OTP for password reset
   */
  async sendForgotPasswordOtp(email: string): Promise<{ message: string; otp_debug?: string }> {
    return apiClient.post<{ message: string; otp_debug?: string }>('/api/auth/forgot-password/send-otp', { email });
  },

  /**
   * Verify the 6-digit OTP
   */
  async verifyForgotPasswordOtp(email: string, otp: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/auth/forgot-password/verify-otp', { email, otp });
  },

  /**
   * Reset password with new credentials after OTP verification
   */
  async resetForgotPassword(email: string, password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/auth/forgot-password/reset', { email, password });
  },
};
