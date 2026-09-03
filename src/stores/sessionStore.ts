import { create } from 'zustand';
import { UserProfile, LoginCredentials } from '../types/auth';
import { authApi } from '../api/auth';
import { secureStorage } from '../services/secureStore';
import { APP_CONFIG } from '../config/app-config';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: AuthStatus;
  user: UserProfile | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
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
        set({
          status: 'authenticated',
          token: savedToken,
          user: profile,
          isLoading: false,
        });
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

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(credentials);

      const token = response.token || response.access_token;
      if (!token) {
        throw new Error(response.message || response.detail || 'Authentication failed. Token missing.');
      }

      // Store token securely
      await secureStorage.setAccessToken(token);

      // Store user if returned or fetch profile
      let userProfile = response.user || null;
      if (!userProfile) {
        try {
          userProfile = await authApi.getProfile();
        } catch {
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

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await secureStorage.removeAccessToken();
    await secureStorage.deleteItem(APP_CONFIG.userStorageKey);
    set({
      status: 'unauthenticated',
      token: null,
      user: null,
      isLoading: false,
      error: null,
    });
  },

  setUser: (user: UserProfile | null) => set({ user }),
  clearError: () => set({ error: null }),
}));
