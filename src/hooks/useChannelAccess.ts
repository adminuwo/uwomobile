import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useSessionStore } from '../stores/sessionStore';

/**
 * Normalizes channel key to standard key used in admin governance.
 */
export function normalizeChannelKey(key: string): string {
  const clean = String(key || '').toLowerCase().trim().replace(/-/g, '_');
  if (clean === 'email') return 'outlook';
  if (clean === 'call' || clean === 'voice' || clean === 'voice_video_call' || clean === 'voice_video_calling') return 'calls';
  if (clean === 'proposal' || clean === 'proposal_builder') return 'proposals';
  if (clean === 'quotation' || clean === 'quote' || clean === 'quotation_engine') return 'quotations';
  if (clean === 'invoice' || clean === 'invoice_system') return 'invoices';
  if (clean === 'product' || clean === 'products' || clean === 'ecommerce_catalog') return 'catalog';
  if (clean === 'order') return 'orders';
  if (clean === 'workflow') return 'workflows';
  if (clean === 'automation' || clean === 'autoreply' || clean === 'auto_reply_engine') return 'automations';
  if (clean === 'broadcast') return 'broadcasts';
  if (clean === 'report') return 'reports';
  if (clean === 'knowledge_base') return 'knowledge';
  if (clean === 'team_dashboard') return 'team';
  if (clean === 'zoho_crm_pipeline' || clean === 'zoho_crm') return 'zoho';
  if (clean === 'google_news_radar') return 'google_news';
  if (clean === 'razorpay_gateway' || clean === 'payment' || clean === 'payments') return 'razorpay';
  if (clean === 'g_calendar') return 'google_calendar';
  if (clean === 'g_sheets') return 'google_sheets';
  if (clean === 'g_docs') return 'google_docs';
  if (clean === 'g_slides') return 'google_slides';
  if (clean === 'g_news') return 'google_news';
  return clean;
}

/**
 * Core Hook for Dynamic Channel & Connector Governance across Mobile App.
 * Matches web frontend behavior:
 * If an admin deactivates ANY channel/connector (globally or for this client),
 * it dynamically reflects as "COMING_SOON" across the mobile app.
 */
import { apiClient } from '../api/client';

export function useChannelAccess() {
  const sessionUser = useSessionStore((state) => state.user);
  const userKey = sessionUser?.id || sessionUser?.email || 'anon';

  // Profile data query
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', userKey],
    queryFn: () => authApi.getProfile(),
    staleTime: 1000 * 60, // 1 minute cache
    enabled: !!sessionUser,
  });

  // Direct live global status query (updated whenever admin toggles in Admin Dashboard)
  const { data: liveGlobalData, isLoading: isGlobalLoading, refetch: refetchGlobal } = useQuery({
    queryKey: ['globalConnectorsStatus'],
    queryFn: async () => {
      try {
        return await apiClient.get<{ global_connectors: Record<string, boolean>; status_map?: Record<string, string> }>('/api/connectors/global-status/');
      } catch (e) {
        return null;
      }
    },
    staleTime: 1000 * 15, // 15 seconds cache
    refetchInterval: 1000 * 30, // periodically re-check every 30s
  });

  const client = profileData?.client || sessionUser?.client;

  // Level 1: Global Admin Status (Merged from live endpoint & profile)
  const globalMap = useMemo<Record<string, boolean>>(() => {
    return {
      ...(profileData?.global_connectors || {}),
      ...(client?.global_connectors || {}),
      ...(liveGlobalData?.global_connectors || {}),
    };
  }, [profileData, client, liveGlobalData]);

  // Level 2: Client-Specific Effective Connectors
  const effectiveMap = useMemo<Record<string, any>>(() => {
    return (
      profileData?.effective_connectors ||
      client?.effective_connectors ||
      {}
    );
  }, [profileData, client]);

  // Level 3: Client Channel Access Permissions
  const channelAccess = useMemo<Record<string, boolean>>(() => {
    return client?.channel_access || {};
  }, [client]);

  /**
   * Checks if a channel/connector/feature is deactivated by Admin and thus in "COMING SOON" state.
   */
  const isChannelComingSoon = (rawKey: string): boolean => {
    const key = normalizeChannelKey(rawKey);

    // 1. Direct Global Admin toggle (from live global-status or profile)
    if (globalMap[key] !== undefined) {
      return globalMap[key] === false;
    }

    // 2. Check Effective Connectors map from backend
    if (effectiveMap[key]) {
      const eff = effectiveMap[key];
      if (eff.global_active === false) return true;
      if (eff.is_coming_soon === true) return true;
      if (eff.effective_status === 'COMING_SOON') return true;
      if (eff.client_enabled === false) return true;
      if (eff.effective_access === false) return true;
    }

    // 3. Check direct client channel access
    if (channelAccess[key] === false) {
      return true;
    }

    // 4. If explicit flag on client object exists and is false
    const enabledProp = `${key}_enabled`;
    if (client && (client as any)[enabledProp] === false) {
      return true;
    }

    // Default core channels (whatsapp, facebook, instagram) to active unless disabled
    const coreChannels = ['whatsapp', 'facebook', 'instagram'];
    if (coreChannels.includes(key)) {
      return false;
    }

    return false;
  };

  /**
   * Checks if a channel is active and accessible.
   */
  const isChannelActive = (rawKey: string): boolean => {
    return !isChannelComingSoon(rawKey);
  };

  const refetch = async () => {
    await Promise.allSettled([refetchProfile(), refetchGlobal()]);
  };

  return {
    isChannelComingSoon,
    isChannelActive,
    globalMap,
    effectiveMap,
    channelAccess,
    client,
    isLoading: isProfileLoading || isGlobalLoading,
    refetch,
  };
}
