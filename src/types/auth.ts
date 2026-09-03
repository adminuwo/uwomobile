export type UserRole = 'ADMIN' | 'CLIENT' | 'SUPERADMIN' | 'TEAM_MEMBER' | string;

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  username?: string;
  role?: UserRole;
  phone?: string;
  avatar_url?: string;
  client_id?: string;
  workspace_id?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  refresh_token?: string;
  user?: UserProfile;
  message?: string;
  detail?: string;
}

export interface ApiErrorResponse {
  detail?: string | Array<{ msg?: string; detail?: string }>;
  message?: string;
  error?: string;
  code?: string;
  status?: number;
}
