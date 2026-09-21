/**
 * sessionLifecycle.ts
 * ──────────────────────────────────────────────────────────────────
 * Centralized session-reset service for UwoConnect Mobile.
 *
 * This module is the **single source of truth** for "logout".
 * It guarantees that when a user signs out (or their token is
 * invalidated by a 401), every piece of user-scoped state is
 * destroyed before the app navigates back to the login screen.
 *
 * What it clears:
 *  1. WebSocket connection (inbox)
 *  2. All in-flight Axios requests (via AbortController registry)
 *  3. React-Query cache (queries + mutations)
 *  4. JWT / refresh tokens in SecureStore
 *  5. Cached user profile in SecureStore
 *  6. Cached brand config in SecureStore
 *  7. Zustand stores: session, brand, drawer, content, connectorsTab
 *  8. Content cache (file-system / AsyncStorage)
 *  9. Navigation stack → replace to /(auth)/login
 * ──────────────────────────────────────────────────────────────────
 */

import { router } from 'expo-router';
import { queryClient } from '../config/queryClient';
import { APP_CONFIG } from '../config/app-config';
import { secureStorage } from './secureStore';
import { inboxWebSocket } from './inboxWebSocket';
import { contentCacheStorage } from './contentCacheStorage';
import { cancelAllPendingRequests, setLoggingOutFlag } from '../api/client';
import { useSessionStore } from '../stores/sessionStore';
import { useBrandStore } from '../stores/brandStore';
import { useDrawerStore } from '../stores/drawerStore';
import { useContentStore } from '../stores/contentStore';
import { useConnectorsTabStore } from '../stores/connectorsTabStore';

// Prevent concurrent logout calls (e.g. multiple 401s firing at once)
let logoutInProgress = false;

/**
 * Perform a full, deterministic session reset and navigate to the login screen.
 *
 * Safe to call from:
 *  - The logout button (more.tsx / SidebarDrawer)
 *  - The 401 response interceptor in client.ts
 *  - Any guard or deep-link handler
 */
export async function logoutAndResetSession(): Promise<void> {
  if (logoutInProgress) return;
  logoutInProgress = true;
  setLoggingOutFlag(true);

  try {
    console.log('[SessionLifecycle] ── Starting full session reset ──');

    // 1. Disconnect WebSocket immediately to stop receiving events
    try {
      inboxWebSocket.resetAndDisconnect();
      console.log('[SessionLifecycle] ✓ WebSocket disconnected');
    } catch (e) {
      console.log('[SessionLifecycle] WebSocket disconnect note:', e);
    }

    // 2. Cancel all in-flight HTTP requests
    try {
      cancelAllPendingRequests();
      console.log('[SessionLifecycle] ✓ In-flight requests cancelled');
    } catch (e) {
      console.log('[SessionLifecycle] Cancel requests note:', e);
    }

    // 3. Remove auth tokens and wipe memory cache first so no subsequent triggers use old token
    try {
      await secureStorage.removeAccessToken();
      await secureStorage.deleteItem(APP_CONFIG.refreshTokenStorageKey);
      await secureStorage.deleteItem(APP_CONFIG.userStorageKey);
      await secureStorage.deleteItem(APP_CONFIG.brandStorageKey);
      secureStorage.clearMemoryCache();
      console.log('[SessionLifecycle] ✓ Auth tokens and storage keys removed');
    } catch (e) {
      console.log('[SessionLifecycle] Token removal note:', e);
    }

    // 4. Purge React-Query cache (queries + mutations) completely
    try {
      queryClient.cancelQueries();
      queryClient.clear();
      queryClient.removeQueries();
      console.log('[SessionLifecycle] ✓ React-Query cache completely purged');
    } catch (e) {
      console.log('[SessionLifecycle] Query cache note:', e);
    }

    // 5. Reset Zustand stores to initial state
    try {
      useSessionStore.setState({
        status: 'unauthenticated',
        token: null,
        user: null,
        isLoading: false,
        error: null,
      });
      useBrandStore.getState().reset();
      useDrawerStore.getState().reset();
      useContentStore.getState().reset();
      useConnectorsTabStore.setState({ targetTab: 'ALL' });
      console.log('[SessionLifecycle] ✓ Zustand stores reset');
    } catch (e) {
      console.log('[SessionLifecycle] Store reset note:', e);
    }

    // 6. Clear content cache (dynamic content / banners)
    try {
      await contentCacheStorage.deleteItem('uwo_dynamic_content_cache');
      console.log('[SessionLifecycle] ✓ Content cache cleared');
    } catch (e) {
      console.log('[SessionLifecycle] Content cache note:', e);
    }

    // 7. Final query cache wipe to ensure zero residual state
    try {
      queryClient.clear();
    } catch {}

    // 8. Navigate to login (replaces entire stack so user cannot "back" into the app)
    try {
      router.replace('/(auth)/login');
      console.log('[SessionLifecycle] ✓ Navigated to login');
    } catch (e) {
      console.log('[SessionLifecycle] Navigation note:', e);
    }

    console.log('[SessionLifecycle] ── Session reset complete ──');
  } finally {
    logoutInProgress = false;
    setLoggingOutFlag(false);
  }
}
