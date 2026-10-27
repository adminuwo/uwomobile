import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../config/app-config';
import { contentCacheStorage } from './contentCacheStorage';

// Memory fallback for instant synchronous reads and environments where SecureStore isn't available
const memoryStorage = new Map<string, string>();

function isLargeKey(key: string, value?: string): boolean {
  // CRITICAL SECURITY: Auth tokens and credentials must always remain in hardware-backed SecureStore
  if (
    key === APP_CONFIG.tokenStorageKey ||
    key === APP_CONFIG.refreshTokenStorageKey ||
    key.toLowerCase().includes('token') ||
    key.toLowerCase().includes('secret')
  ) {
    return false;
  }
  if (
    key === APP_CONFIG.userStorageKey ||
    key === APP_CONFIG.brandStorageKey ||
    key.startsWith('cache_')
  ) {
    return true;
  }
  if (value && value.length > 2000) {
    return true;
  }
  return false;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (memoryStorage.has(key)) {
        return memoryStorage.get(key)!;
      }
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          const val = localStorage.getItem(key);
          if (val) memoryStorage.set(key, val);
          return val;
        }
        return null;
      }

      if (isLargeKey(key)) {
        const fileVal = await contentCacheStorage.getItem(key);
        if (fileVal) {
          memoryStorage.set(key, fileVal);
          return fileVal;
        }
      }

      const val = await SecureStore.getItemAsync(key);
      if (val) {
        memoryStorage.set(key, val);
      }
      return val;
    } catch (error) {
      console.warn(`[SecureStore] Error reading key "${key}":`, error);
      return memoryStorage.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryStorage.set(key, value);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }

      if (isLargeKey(key, value)) {
        await contentCacheStorage.setItem(key, value);
        return;
      }

      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`[SecureStore] Error setting key "${key}":`, error);
      // Fall back to contentCacheStorage only for non-sensitive data
      if (!key.toLowerCase().includes('token') && !key.toLowerCase().includes('secret')) {
        try {
          await contentCacheStorage.setItem(key, value);
        } catch {}
      }
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      memoryStorage.delete(key);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }

      await Promise.allSettled([
        SecureStore.deleteItemAsync(key),
        contentCacheStorage.deleteItem(key),
      ]);
    } catch (error) {
      console.warn(`[SecureStore] Error deleting key "${key}":`, error);
    }
  },

  // Token helper shortcuts
  async getAccessToken(): Promise<string | null> {
    return this.getItem(APP_CONFIG.tokenStorageKey);
  },

  async setAccessToken(token: string): Promise<void> {
    await this.setItem(APP_CONFIG.tokenStorageKey, token);
  },

  async removeAccessToken(): Promise<void> {
    await this.deleteItem(APP_CONFIG.tokenStorageKey);
  },

  clearMemoryCache(): void {
    memoryStorage.clear();
  },
};

export const secureStore = {
  getToken: (): Promise<string | null> => secureStorage.getAccessToken(),
};
