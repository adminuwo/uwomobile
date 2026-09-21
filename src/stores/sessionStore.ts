import { create } from 'zustand';
import { UserProfile, LoginCredentials, RegisterPayload } from '../types/auth';
import { authApi } from '../api/auth';
import { secureStorage } from '../services/secureStore';
import { APP_CONFIG } from '../config/app-config';
import { queryClient } from '../config/queryClient';
import { useBrandStore } from './brandStore';
import { useContentStore } from './contentStore';
import { contentCacheStorage } from '../services/contentCacheStorage';
import { trackAppInstallation } from '../services/appInstallTracker';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: AuthStatus;
  user: UserProfile | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithGoogle: (idToken: string, extra?: { name?: string; invite_token?: string }) => Promise<boolean>;
  loginWithApple: (identityToken: string, extra?: { name?: string; invite_token?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'initializing',
  user: null,
  token: null,
  error: null,
  isLoading: false,

  initialize: async () => {
    try {
      set({ status: 'initializing', isLoading: true, error: null });
      const savedToken = await secureStorage.getAccessToken();

      if (!savedToken) {
        set({ status: 'unauthenticated', token: null, user: null, isLoading: false });
        return;
      }

      // Try fetching profile with saved token
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          await secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(profile));
        }
        set({
          status: 'authenticated',
          token: savedToken,
          user: profile,
          isLoading: false,
        });
        useBrandStore.getState().fetchBrandConfig().catch(() => {});
        trackAppInstallation(true).catch(() => {});
      } catch (profileErr) {
        // Fallback: If offline or token error, attempt loading cached user
        const cachedUserStr = await secureStorage.getItem(APP_CONFIG.userStorageKey);
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          set({
            status: 'authenticated',
            token: savedToken,
            user: cachedUser,
            isLoading: false,
          });
          trackAppInstallation(true).catch(() => {});
        } else {
          // Token invalid or profile unreachable without cache
          await secureStorage.removeAccessToken();
          set({ status: 'unauthenticated', token: null, user: null, isLoading: false });
        }
      }
    } catch (err: any) {
      set({
        status: 'unauthenticated',
        token: null,
        user: null,
        isLoading: false,
        error: err.message || 'Initialization failed',
      });
    }
  },

  register: async (payload: RegisterPayload) => {
    try {
      set({ isLoading: true, error: null });
      // Clear all cached data from any previously logged-in account
      queryClient.clear();
      useContentStore.getState().reset();
      await contentCacheStorage.deleteItem('uwo_dynamic_content_cache');
      const response = await authApi.register(payload);

      const token = response.token || response.access_token;
      if (!token) {
        set({ isLoading: false });
        return true;
      }

      // Store token securely
      await secureStorage.setAccessToken(token);

      // Store user if returned or fetch profile
      let userProfile = response.user || null;
      if (!userProfile) {
        try {
          userProfile = await authApi.getProfile();
        } catch {
          userProfile = {
            email: payload.email,
            first_name: payload.first_name,
            company_name: payload.business_name,
          };
        }
      }

      if (userProfile) {
        await secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(userProfile));
      }

      set({
        status: 'authenticated',
        token,
        user: userProfile,
        isLoading: false,
        error: null,
      });

      useBrandStore.getState().fetchBrandConfig().catch(() => {});
      trackAppInstallation(true).catch(() => {});
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.meta_portfolio_eligible?.[0] ||
        err.message ||
        'Registration failed. Please try again.';
      set({
        isLoading: false,
        error: errorMsg,
      });
      return false;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      // Clear all cached data from any previously logged-in account
      queryClient.clear();
      useContentStore.getState().reset();
      await contentCacheStorage.deleteItem('uwo_dynamic_content_cache');

      const response = await authApi.login(credentials);

      const token = response.token || response.access_token;
      if (!token) {
        throw new Error(response.message || response.detail || 'Authentication failed. Token missing.');
      }

      // Store token securely
      await secureStorage.setAccessToken(token);

      // Purge query cache now that token is saved
      queryClient.cancelQueries();
      queryClient.clear();

      // Fetch fresh profile with newly saved token to ensure complete tenant details
      let userProfile: UserProfile | null = response.user || null;
      try {
        const freshProfile = await authApi.getProfile(token);
        if (freshProfile) {
          userProfile = freshProfile;
        }
      } catch (profileErr) {
        if (!userProfile) {
          userProfile = { email: credentials.email };
        }
      }

      if (userProfile) {
        await secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(userProfile));
      }

      set({
        status: 'authenticated',
        token,
        user: userProfile,
        isLoading: false,
        error: null,
      });

      useBrandStore.getState().fetchBrandConfig().catch(() => {});
      trackAppInstallation(true).catch(() => {});
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  },

  loginWithGoogle: async (idToken: string, extra?: { name?: string; invite_token?: string }) => {
    try {
      set({ isLoading: true, error: null });
      // Clear all cached data from any previously logged-in account
      queryClient.cancelQueries();
      queryClient.clear();
      useContentStore.getState().reset();
      await contentCacheStorage.deleteItem('uwo_dynamic_content_cache');
      const response = await authApi.loginWithGoogle(idToken, extra);

      const token = response.token || response.access_token;
      if (!token) {
        throw new Error(response.message || response.detail || 'Google authentication failed. Token missing.');
      }

      // Store token securely
      await secureStorage.setAccessToken(token);

      // Purge query cache now that token is saved
      queryClient.cancelQueries();
      queryClient.clear();

      // Fetch fresh profile
      let userProfile: UserProfile | null = response.user || null;
      try {
        const freshProfile = await authApi.getProfile(token);
        if (freshProfile) {
          userProfile = freshProfile;
        }
      } catch {
        if (!userProfile) {
          userProfile = { email: extra?.name || 'google_user' };
        }
      }

      if (userProfile) {
        await secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(userProfile));
      }

      set({
        status: 'authenticated',
        token,
        user: userProfile,
        isLoading: false,
        error: null,
      });

      useBrandStore.getState().fetchBrandConfig().catch(() => {});
      trackAppInstallation(true).catch(() => {});
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Google authentication failed. Please try again.',
      });
      return false;
    }
  },

  loginWithApple: async (identityToken: string, extra?: { name?: string; invite_token?: string }) => {
    try {
      set({ isLoading: true, error: null });
      queryClient.cancelQueries();
      queryClient.clear();
      useContentStore.getState().reset();
      await contentCacheStorage.deleteItem('uwo_dynamic_content_cache');
      const response = await authApi.loginWithApple(identityToken, extra);

      const token = response.token || response.access_token;
      if (!token) {
        throw new Error(response.message || response.detail || 'Apple authentication failed. Token missing.');
      }

      await secureStorage.setAccessToken(token);
      queryClient.cancelQueries();
      queryClient.clear();

      let userProfile: UserProfile | null = response.user || null;
      try {
        const freshProfile = await authApi.getProfile(token);
        if (freshProfile) {
          userProfile = freshProfile;
        }
      } catch {
        if (!userProfile) {
          userProfile = { email: extra?.name || 'apple_user' };
        }
      }

      if (userProfile) {
        await secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(userProfile));
      }

      set({
        status: 'authenticated',
        token,
        user: userProfile,
        isLoading: false,
        error: null,
      });

      useBrandStore.getState().fetchBrandConfig().catch(() => {});
      trackAppInstallation(true).catch(() => {});
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Apple authentication failed. Please try again.',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Use the centralized session-lifecycle service for a complete reset
      const { logoutAndResetSession } = require('../services/sessionLifecycle');
      await logoutAndResetSession();
    } catch (e) {
      console.log('[SessionStore] Logout fallback:', e);
      // Fallback: at minimum clear tokens and reset state
      await secureStorage.removeAccessToken();
      await secureStorage.deleteItem(APP_CONFIG.userStorageKey);
      queryClient.clear();
      set({
        status: 'unauthenticated',
        token: null,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  setUser: (user: UserProfile | null) => set({ user }),
  clearError: () => set({ error: null }),
}));
