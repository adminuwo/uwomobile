import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface EnvConfig {
  APP_ENV: AppEnvironment;
  API_BASE_URL: string;
  APP_VERSION: string;
  IS_DEV: boolean;
}

const DEFAULT_PRODUCTION_URL = 'https://uwoconnectforrb-743928421487.asia-south1.run.app';

const getDynamicApiUrl = (): string => {
  const hostUri = 
    Constants.expoConfig?.hostUri || 
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost || 
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080`;
    }
  }

  if (Constants.linkingUri) {
    try {
      const parsed = new URL(Constants.linkingUri);
      if (parsed.hostname && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return `http://${parsed.hostname}:8080`;
      }
    } catch {}
  }

  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('192.168.29.183')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://192.168.29.178:8080';
};


const getEnv = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra || {};
  const processEnv = process.env;

  // __DEV__ is false in compiled production/release APK builds
  const isDevelopmentBuild = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  const appEnv = (processEnv.EXPO_PUBLIC_APP_ENV || extra.APP_ENV || (isDevelopmentBuild ? 'development' : 'production')) as AppEnvironment;
  const isDev = isDevelopmentBuild && appEnv === 'development';

  // In development, automatically connect to the local Django server on port 8080
  let apiBaseUrl = isDev
    ? getDynamicApiUrl()
    : (process.env.EXPO_PUBLIC_API_URL || DEFAULT_PRODUCTION_URL);

  return {
    APP_ENV: appEnv,
    API_BASE_URL: apiBaseUrl.replace(/\/$/, ''),
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
    IS_DEV: isDev,
  };
};

export const env = getEnv();
