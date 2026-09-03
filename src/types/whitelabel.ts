export interface WhiteLabelConfig {
  brand_name: string;
  tagline?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  support_email?: string;
  custom_domain?: string | null;
  is_active?: boolean;
}
