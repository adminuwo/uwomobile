import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../config/app-config';

// Memory fallback for environments where SecureStore isn't available (e.g. web testing)
const memoryStorage = new Map<string, string>();

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return memoryStorage.get(key) || localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStore] Error reading key "${key}":`, error);
      return memoryStorage.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryStorage.set(key, value);
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`[SecureStore] Error setting key "${key}":`, error);
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      memoryStorage.delete(key);
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
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
};

export const secureStore = {
  getToken: (): Promise<string | null> => secureStorage.getAccessToken(),
};

