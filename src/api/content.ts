import { apiClient } from './client';

export interface AppContentVersionResponse {
  version: number;
  updated_at: string;
  maintenance: {
    is_active: boolean;
    title: string;
    message: string;
    estimated_completion: string;
  };
}

export interface DynamicBannerItem {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  image_url?: string;
  image_url_display?: string;
  action_type: 'none' | 'route' | 'url' | 'modal';
  action_url?: string;
  placement: string;
  display_order: number;
  is_active: boolean;
  draft_mode: boolean;
}

export interface FullAppContentResponse {
  version: number;
  lang: string;
  updated_at: string;
  content: Record<string, string>;
  banners: DynamicBannerItem[];
  features: Record<string, boolean>;
  maintenance: {
    is_active: boolean;
    title: string;
    message: string;
    estimated_completion: string;
  };
  legal: {
    terms_version: string;
    terms_effective_date: string | null;
    privacy_version: string;
    privacy_effective_date: string | null;
  };
}

export const contentApi = {
  /**
   * Lightweight version & maintenance check.
   */
  async checkVersion(cachedVersion?: number): Promise<AppContentVersionResponse | null> {
    try {
      return await apiClient.get<AppContentVersionResponse>('/api/app/content/version/');
    } catch (error) {
      console.log('[ContentApi] Version check error (offline fallback active):', error);
      return null;
    }
  },

  /**
   * Fetch full dynamic content bundle for the specified language.
   */
  async getFullContent(lang: string = 'en'): Promise<FullAppContentResponse | null> {
    try {
      return await apiClient.get<FullAppContentResponse>(`/api/app/content/?lang=${encodeURIComponent(lang)}`);
    } catch (error) {
      console.log('[ContentApi] Full content fetch error (offline fallback active):', error);
      return null;
    }
  },
};
