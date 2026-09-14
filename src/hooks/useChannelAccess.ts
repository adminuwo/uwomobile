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
export function useChannelAccess() {
  const sessionUser = useSessionStore((state) => state.user);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  const client = profileData?.client || sessionUser?.client;

  // Level 1: Global Admin Status
  const globalMap = useMemo<Record<string, boolean>>(() => {
    return (
      profileData?.global_connectors ||
      client?.global_connectors ||
      {}
    );
  }, [profileData, client]);

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
   * Checks if a channel/connector is deactivated by Admin and thus in "COMING SOON" state.
   */
  const isChannelComingSoon = (rawKey: string): boolean => {
    const key = normalizeChannelKey(rawKey);

    // 1. Check Global Admin connector toggle
    if (globalMap[key] === false) {
      return true;
    }

    // 2. Check Effective Connectors map from backend
    if (effectiveMap[key]) {
      const eff = effectiveMap[key];
      if (eff.global_active === false) return true;
      if (eff.client_enabled === false) return true;
      if (eff.effective_access === false) return true;
      if (eff.effective_status === 'COMING_SOON') return true;
    }

    // 3. Check direct client channel access
    if (channelAccess[key] === false) {
      return true;
    }

    // 4. If backend has returned data and connector is not in global active list,
    // default core channels (whatsapp, facebook, instagram) to active, others check flags
    const coreChannels = ['whatsapp', 'facebook', 'instagram'];
    if (coreChannels.includes(key)) {
      return false; // Active unless explicitly disabled above
    }

    // If explicit flag on client object exists and is false
    const enabledProp = `${key}_enabled`;
    if (client && (client as any)[enabledProp] === false) {
      return true;
    }

    // If global connectors map exists and connector is not enabled
    if (Object.keys(globalMap).length > 0 && !globalMap[key]) {
      return true;
    }

    return false;
  };

  /**
   * Checks if a channel is active and accessible.
   */
  const isChannelActive = (rawKey: string): boolean => {
    return !isChannelComingSoon(rawKey);
  };

  return {
    isChannelComingSoon,
    isChannelActive,
    globalMap,
    effectiveMap,
    channelAccess,
    client,
    isLoading,
    refetch,
  };
}
