export type UserRole = 'ADMIN' | 'CLIENT' | 'SUPERADMIN' | 'TEAM_MEMBER' | string;

export interface ClientInfo {
  id?: string;
  business_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  company_logo_url?: string;
  logo?: string;
  company_logo?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_access_token?: string;
  automation_enabled?: boolean;
  instagram_enabled?: boolean;
  facebook_enabled?: boolean;
  gmail_enabled?: boolean;
  outlook_enabled?: boolean;
  youtube_enabled?: boolean;
  google_calendar_enabled?: boolean;
  google_sheets_enabled?: boolean;
  google_docs_enabled?: boolean;
  google_slides_enabled?: boolean;
  google_news_enabled?: boolean;
  onedrive_enabled?: boolean;
  zoho_enabled?: boolean;
  telegram_enabled?: boolean;
  slack_enabled?: boolean;
  shopify_enabled?: boolean;
  stripe_enabled?: boolean;
}

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  first_name?: string;
  username?: string;
  role?: UserRole;
  phone?: string;
  avatar_url?: string;
  avatar?: string;
  client_id?: string;
  client?: ClientInfo;
  company_name?: string;
  company_logo_url?: string;
  company_logo?: string;
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
