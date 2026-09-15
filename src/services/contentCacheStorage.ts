import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const memoryFallback = new Map<string, string>();

const getFilePath = (key: string) => {
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${FileSystem.documentDirectory || ''}${sanitized}.json`;
};

export const contentCacheStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return memoryFallback.get(key) || null;
      }

      const filePath = getFilePath(key);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        return await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
      return null;
    } catch (err) {
      console.log(`[ContentCacheStorage] Read error for ${key}:`, err);
      return memoryFallback.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryFallback.set(key, value);

      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }

      const filePath = getFilePath(key);
      await FileSystem.writeAsStringAsync(filePath, value, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (err) {
      console.log(`[ContentCacheStorage] Write error for ${key}:`, err);
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      memoryFallback.delete(key);

      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }

      const filePath = getFilePath(key);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    } catch (err) {
      console.log(`[ContentCacheStorage] Delete error for ${key}:`, err);
    }
  },
};
