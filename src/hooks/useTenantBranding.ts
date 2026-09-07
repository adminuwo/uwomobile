import { useSessionStore } from '../stores/sessionStore';
import { useBrandStore } from '../stores/brandStore';
import { env } from '../config/env';

export interface TenantBranding {
  clientName: string;
  logoUri: string | null;
  initial: string;
  isLoading: boolean;
  hasCustomLogo: boolean;
}

export function useTenantBranding(): TenantBranding {
  const user = useSessionStore((state) => state.user);
  const status = useSessionStore((state) => state.status);
  const isSessionLoading = useSessionStore((state) => state.isLoading);
  const brand = useBrandStore((state) => state.brand);
  const isBrandLoading = useBrandStore((state) => state.isLoading);

  const client = user?.client;

  // Resolve Client Company Name (Prefer authenticated client business/company name)
  const resolvedClientName =
    client?.business_name ||
    client?.company_name ||
    user?.company_name ||
    (brand?.brand_name && brand.brand_name !== 'UwoConnect' && brand.brand_name !== 'UWO Connect' ? brand.brand_name : null) ||
    'Workspace';

  // Resolve Logo URL (Check authenticated client logo fields, user logo fields, and active whitelabel config)
  const rawLogo =
    client?.company_logo_url ||
    client?.logo_url ||
    client?.logo ||
    client?.company_logo ||
    user?.company_logo_url ||
    user?.company_logo ||
    (brand?.is_whitelabel && brand?.logo_url ? brand.logo_url : null);

  const formatLogoUri = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed.includes('download (3).gif')) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const baseUrl = env.API_BASE_URL || 'http://192.168.29.238:8000';
    if (trimmed.startsWith('/')) {
      return `${baseUrl}${trimmed}`;
    }
    return `${baseUrl}/${trimmed}`;
  };

  const logoUri = formatLogoUri(rawLogo);

  // Initial for avatar fallback (e.g. "U" for "Unified Web Options Pvt Ltd")
  const initial = (resolvedClientName || 'W')
    .trim()
    .charAt(0)
    .toUpperCase();

  const isLoading = status === 'initializing' || isSessionLoading || isBrandLoading;

  return {
    clientName: resolvedClientName,
    logoUri,
    initial,
    isLoading,
    hasCustomLogo: !!logoUri,
  };
}
