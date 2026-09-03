import { create } from 'zustand';
import { WhiteLabelConfig } from '../types/whitelabel';
import { whitelabelApi } from '../api/whitelabel';
import { APP_CONFIG } from '../config/app-config';

interface BrandState {
  brand: WhiteLabelConfig;
  isLoading: boolean;
  fetchBrandConfig: () => Promise<void>;
}

export const useBrandStore = create<BrandState>((set) => ({
  brand: {
    brand_name: APP_CONFIG.defaultBrand.brandName,
    tagline: APP_CONFIG.defaultBrand.tagline,
    logo_url: APP_CONFIG.defaultBrand.logoUrl,
    primary_color: APP_CONFIG.defaultBrand.primaryColor,
    secondary_color: APP_CONFIG.defaultBrand.secondaryColor,
  },
  isLoading: false,

  fetchBrandConfig: async () => {
    try {
      set({ isLoading: true });
      const config = await whitelabelApi.getConfig();
      if (config && config.brand_name) {
        set({
          brand: {
            brand_name: config.brand_name || APP_CONFIG.defaultBrand.brandName,
            tagline: config.tagline || APP_CONFIG.defaultBrand.tagline,
            logo_url: config.logo_url || APP_CONFIG.defaultBrand.logoUrl,
            primary_color: config.primary_color || APP_CONFIG.defaultBrand.primaryColor,
            secondary_color: config.secondary_color || APP_CONFIG.defaultBrand.secondaryColor,
            support_email: config.support_email,
            custom_domain: config.custom_domain,
            is_active: config.is_active,
          },
          isLoading: false,
        });
      }
    } catch {
      // Fallback to defaults silently if endpoint not configured or offline
      set({ isLoading: false });
    }
  },
}));
