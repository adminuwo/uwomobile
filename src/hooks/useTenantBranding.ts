import { useSessionStore } from '../stores/sessionStore';
import { useBrandStore } from '../stores/brandStore';
import { resolveValidImageUri } from '../utils/imageUri';

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

  // Helper to filter dummy/placeholder names like 'Test'
  const isInvalidName = (n?: string | null) => !n || !n.trim() || n.trim().toLowerCase() === 'test';

  const validClientBusinessName = !isInvalidName(client?.business_name) ? client!.business_name.trim() : null;
  const validClientCompanyName = !isInvalidName(client?.company_name) ? client!.company_name.trim() : null;
  const validUserCompanyName = !isInvalidName(user?.company_name) ? user!.company_name.trim() : null;
  const validBrandName =
    !isInvalidName(brand?.brand_name) &&
    brand?.brand_name !== 'UwoConnect' &&
    brand?.brand_name !== 'UWO Connect'
      ? brand!.brand_name.trim()
      : null;
  const validUserName = !isInvalidName(user?.name) ? user!.name.trim() : (!isInvalidName(user?.first_name) ? user!.first_name.trim() : null);

  // Resolve Client Company Name (Prefer authenticated client business/company name)
  const resolvedClientName =
    validClientBusinessName ||
    validClientCompanyName ||
    validUserCompanyName ||
    validBrandName ||
    validUserName ||
    'UWO Connect';

  // Resolve Logo URL (Check authenticated client logo fields, user logo fields, and active whitelabel config)
  const rawLogo =
    client?.company_logo_url ||
    client?.logo_url ||
    client?.logo ||
    client?.company_logo ||
    user?.company_logo_url ||
    user?.company_logo ||
    (brand?.is_whitelabel && brand?.logo_url ? brand.logo_url : null);

  const logoUri = resolveValidImageUri(rawLogo);

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
