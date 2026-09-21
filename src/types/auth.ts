export type UserRole = 'ADMIN' | 'CLIENT' | 'SUPERADMIN' | 'TEAM_MEMBER' | string;

export interface ClientInfo {
  id?: string;
  business_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  logo_url?: string;
  company_logo_url?: string;
  logo?: string;
  company_logo?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_waba_id?: string;
  whatsapp_access_token?: string;
  whatsapp_config?: Record<string, any>;
  facebook_config?: Record<string, any>;
  instagram_config?: Record<string, any>;
  gmail_config?: Record<string, any>;
  outlook_config?: Record<string, any>;
  youtube_config?: Record<string, any>;
  settings?: Record<string, any>;
  automation_enabled?: boolean;
  whatsapp_enabled?: boolean;
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
  global_connectors?: Record<string, boolean>;
  effective_connectors?: Record<string, any>;
  channel_access?: Record<string, boolean>;
  meta_portfolio_name?: string;
  plan?: string;
  assigned_plan?: any;
}

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
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
  global_connectors?: Record<string, boolean>;
  effective_connectors?: Record<string, any>;
  meta_portfolio_eligible?: boolean;
  plan?: string;
  meta_portfolio_name?: string;
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

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  phone_number?: string;
  meta_portfolio_eligible: boolean;
  meta_portfolio_name?: string;
  portfolio_name?: string;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  terms_version?: string;
  privacy_version?: string;
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
