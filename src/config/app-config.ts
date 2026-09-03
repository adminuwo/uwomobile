export const APP_CONFIG = {
  appName: 'UwoConnect',
  tagline: 'Unified Communication & Business Automation',
  defaultTenantName: 'UwoConnect',
  supportEmail: 'support@uwoconnect.com',
  apiTimeout: 15000, // 15 seconds
  tokenStorageKey: 'uwo_mobile_access_token',
  refreshTokenStorageKey: 'uwo_mobile_refresh_token',
  userStorageKey: 'uwo_mobile_user_data',
  brandStorageKey: 'uwo_mobile_brand_config',
  defaultBrand: {
    brandName: 'UwoConnect',
    tagline: 'Unified Business Automation',
    logoUrl: null,
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    darkBg: '#0a120d',
    cardBg: '#16271c',
  },
} as const;
