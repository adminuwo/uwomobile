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

  // Resolve Client Company Name
  const resolvedClientName =
    client?.business_name ||
    client?.company_name ||
    user?.company_name ||
    (brand?.brand_name && brand.brand_name !== 'UwoConnect' ? brand.brand_name : null) ||
    'My Workspace';

  // Resolve Logo URL (check client logo fields, user logo fields, avatar, and brand logo)
  const rawLogo =
    client?.company_logo_url ||
    client?.logo_url ||
    client?.logo ||
    client?.company_logo ||
    user?.company_logo_url ||
    user?.company_logo ||
    user?.avatar ||
    brand?.logo_url;

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

  // Initial for avatar fallback
  const initial = (resolvedClientName || 'C')
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
