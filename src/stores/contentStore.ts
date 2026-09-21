import { create } from 'zustand';
import { contentApi, DynamicBannerItem, FullAppContentResponse } from '../api/content';
import { contentCacheStorage } from '../services/contentCacheStorage';

const STORAGE_KEY = 'uwo_dynamic_content_cache';

export interface MaintenanceState {
  is_active: boolean;
  title: string;
  message: string;
  estimated_completion: string;
}

export interface ContentState {
  version: number;
  lang: string;
  content: Record<string, string>;
  banners: DynamicBannerItem[];
  features: Record<string, boolean>;
  maintenance: MaintenanceState;
  isLoading: boolean;
  isOffline: boolean;
  lastSyncedAt: string | null;

  initialize: (initialLang?: string) => Promise<void>;
  checkVersionAndSync: (forcedLang?: string) => Promise<void>;
  fetchFullContent: (targetLang?: string) => Promise<void>;
  getContent: (key: string, fallback?: string) => string;
  isFeatureEnabled: (featureKey: string, defaultVal?: boolean) => boolean;
  reset: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  version: 1,
  lang: 'en',
  content: {
    app_name: 'UWO Connect',
    welcome_title: 'Welcome to UWO Connect',
    welcome_subtitle: 'Manage customer conversations across WhatsApp, Meta, Google, and CRM in one place.',
    support_email: 'support@uwo24.com',
    support_phone: '+91 83589 90909',
    support_hours: 'Monday - Saturday, 9:00 AM - 7:00 PM IST',
    announcement_active: 'true',
    announcement_title: 'New AI Copilot Live!',
    announcement_message: 'Connect your WhatsApp & Instagram channels to automate client responses with AI 24/7.',
  },
  banners: [],
  features: {
    crm_module: true,
    workflows_module: true,
    connectors_module: true,
    ai_copilot: true,
    news_feed: true,
  },
  maintenance: {
    is_active: false,
    title: 'Under Maintenance',
    message: 'We are upgrading UWO Connect to deliver better speed and reliability.',
    estimated_completion: 'Within 30 minutes',
  },
  isLoading: false,
  isOffline: false,
  lastSyncedAt: null,

  initialize: async (initialLang = 'en') => {
    try {
      // 1. Load cached content from storage immediately (offline safe, 0 network delay)
      const cachedStr = await contentCacheStorage.getItem(STORAGE_KEY);
      let hasCachedContent = false;
      if (cachedStr) {
        try {
          const cachedData: FullAppContentResponse = JSON.parse(cachedStr);
          if (cachedData && cachedData.version) {
            hasCachedContent = true;
            set({
              version: cachedData.version,
              lang: cachedData.lang || initialLang,
              content: { ...get().content, ...(cachedData.content || {}) },
              banners: cachedData.banners || [],
              features: { ...get().features, ...(cachedData.features || {}) },
              maintenance: cachedData.maintenance || get().maintenance,
              lastSyncedAt: cachedData.updated_at || null,
            });
          }
        } catch (e) {
          console.log('[ContentStore] Error parsing cached content:', e);
        }
      }

      // 2. If no valid cache or banners missing, fetch full content immediately
      if (!hasCachedContent || get().banners.length === 0) {
        console.log('[ContentStore] Cache unpopulated or empty banners, fetching full content...');
        await get().fetchFullContent(initialLang);
      } else {
        // 3. Perform background version check and sync
        await get().checkVersionAndSync(initialLang);
      }
    } catch (err) {
      console.log('[ContentStore] Initialization error (using fallbacks):', err);
    }
  },

  checkVersionAndSync: async (forcedLang) => {
    const currentLang = forcedLang || get().lang || 'en';
    const cachedVer = get().version;

    try {
      const versionRes = await contentApi.checkVersion(cachedVer);
      if (!versionRes) {
        // Network unavailable or timeout
        set({ isOffline: true });
        return;
      }

      set({ isOffline: false });

      // Always update maintenance status immediately so the blocker responds in real time
      if (versionRes.maintenance) {
        set((state) => ({
          maintenance: {
            ...state.maintenance,
            ...versionRes.maintenance,
          },
        }));
      }

      // If remote version is newer, local cache is empty, or banners not loaded, fetch full content
      if (versionRes.version > cachedVer || Object.keys(get().content).length <= 8 || get().banners.length === 0) {
        console.log(`[ContentStore] Remote version v${versionRes.version} (cached v${cachedVer}). Fetching latest content...`);
        await get().fetchFullContent(currentLang);
      }
    } catch (err) {
      console.log('[ContentStore] Version check skipped:', err);
      set({ isOffline: true });
    }
  },

  fetchFullContent: async (targetLang) => {
    const langToFetch = targetLang || get().lang || 'en';
    set({ isLoading: true });

    try {
      const data = await contentApi.getFullContent(langToFetch);
      if (data && data.version) {
        set({
          version: data.version,
          lang: langToFetch,
          content: data.content || {},
          banners: data.banners || [],
          features: data.features || {},
          maintenance: data.maintenance || get().maintenance,
          lastSyncedAt: data.updated_at,
          isLoading: false,
          isOffline: false,
        });

        // Persist to contentCacheStorage for offline availability
        await contentCacheStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log(`[ContentStore] Synced v${data.version} (${langToFetch}) successfully.`);
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.log('[ContentStore] Fetch full content failed, keeping cached:', err);
      set({ isLoading: false, isOffline: true });
    }
  },

  getContent: (key: string, fallback: string = ''): string => {
    const state = get();
    const val = state.content[key];
    if (val !== undefined && val !== null && String(val).trim().length > 0) {
      return String(val);
    }
    return fallback;
  },

  isFeatureEnabled: (featureKey: string, defaultVal: boolean = true): boolean => {
    const state = get();
    if (state.features && state.features[featureKey] !== undefined) {
      return Boolean(state.features[featureKey]);
    }
    return defaultVal;
  },

  reset: () => {
    set({
      version: 1,
      lang: 'en',
      content: {
        app_name: 'UWO Connect',
        welcome_title: 'Welcome to UWO Connect',
        welcome_subtitle: 'Manage customer conversations across WhatsApp, Meta, Google, and CRM in one place.',
        support_email: 'support@uwo24.com',
        support_phone: '+91 83589 90909',
        support_hours: 'Monday - Saturday, 9:00 AM - 7:00 PM IST',
        announcement_active: 'true',
        announcement_title: 'New AI Copilot Live!',
        announcement_message: 'Connect your WhatsApp & Instagram channels to automate client responses with AI 24/7.',
      },
      banners: [],
      features: {
        crm_module: true,
        workflows_module: true,
        connectors_module: true,
        ai_copilot: true,
        news_feed: true,
      },
      maintenance: {
        is_active: false,
        title: 'Under Maintenance',
        message: 'We are upgrading UWO Connect to deliver better speed and reliability.',
        estimated_completion: 'Within 30 minutes',
      },
      isLoading: false,
      isOffline: false,
      lastSyncedAt: null,
    });
  },
}));
