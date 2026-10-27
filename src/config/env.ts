import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface EnvConfig {
  APP_ENV: AppEnvironment;
  API_BASE_URL: string;
  APP_VERSION: string;
  IS_DEV: boolean;
  GOOGLE_WEB_CLIENT_ID: string;
  GOOGLE_ANDROID_CLIENT_ID: string;
  GOOGLE_IOS_CLIENT_ID: string;
}

export const PRODUCTION_DOMAIN = 'https://uwoconnect.aisa24.com';
export const LIVE_BACKEND_URL = 'https://uwoconnectforrb-743928421487.asia-south1.run.app';
const DEFAULT_PRODUCTION_URL = LIVE_BACKEND_URL;

const getDynamicApiUrl = (): string => {
  // 1. Explicit env variable takes highest priority (.env, EXPO_PUBLIC_API_URL, API_BASE_URL)
  const candidate =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    (Constants.expoConfig?.extra as any)?.API_BASE_URL;

  // 2. Extract host IP from Metro bundler if available (useful for LAN/physical devices)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || '';
  const host = hostUri ? hostUri.split(':')[0] : null;

  if (candidate && candidate.trim()) {
    const trimmed = candidate.trim().replace(/\/$/, '');
    // If explicit remote URL (https://...), use it directly
    if (!isLocalAddress(trimmed)) {
      return trimmed;
    }
    // If it's a local address and we are on Android
    const portMatch = trimmed.match(/:(\d+)$/);
    const targetPort = portMatch ? portMatch[1] : '8000';

    if (Platform.OS === 'android') {
      // In Android emulator with adb reverse, 127.0.0.1 connects instantly to host machine
      if (!Constants.isDevice || trimmed.includes('127.0.0.1') || trimmed.includes('localhost')) {
        return `http://127.0.0.1:${targetPort}`;
      }
      if (trimmed.includes('10.0.2.2')) {
        return `http://10.0.2.2:${targetPort}`;
      }
      // Real physical device on LAN Wi-Fi
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:${targetPort}`;
      }
      return `http://127.0.0.1:${targetPort}`;
    }
    // iOS simulator connects directly via 127.0.0.1
    if (Platform.OS === 'ios') {
      if (!Constants.isDevice) {
        return `http://127.0.0.1:${targetPort}`;
      }
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:${targetPort}`;
      }
      return `http://127.0.0.1:${targetPort}`;
    }
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${targetPort}`;
    }
    return trimmed;
  }

  // 3. Fallbacks if no candidate configured
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return 'http://127.0.0.1:8000';
  }

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000`;
  }

  return 'http://127.0.0.1:8000';
};


const isLocalAddress = (url?: string | null): boolean => {
  if (!url) return true;
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('10.0.2.2') ||
    url.includes('192.168.') ||
    url.includes('10.') ||
    url.includes('172.16.')
  );
};

const getEnv = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra || {};
  const processEnv = process.env;

  // __DEV__ is false in compiled production/release APK & AAB builds
  const isDevelopmentBuild = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  const appEnv = (processEnv.EXPO_PUBLIC_APP_ENV || extra.APP_ENV || (isDevelopmentBuild ? 'development' : 'production')) as AppEnvironment;
  const isDev = isDevelopmentBuild && appEnv === 'development';

  let apiBaseUrl: string;
  if (isDev) {
    apiBaseUrl = getDynamicApiUrl();
  } else {
    // Production / Release Build: ensure we NEVER bake in a private local IP
    const candidateUrl =
      process.env.PROD_API_BASE_URL ||
      process.env.EXPO_PUBLIC_PROD_API_URL ||
      (!isLocalAddress(process.env.EXPO_PUBLIC_API_BASE_URL) ? process.env.EXPO_PUBLIC_API_BASE_URL : null) ||
      (!isLocalAddress(process.env.EXPO_PUBLIC_API_URL) ? process.env.EXPO_PUBLIC_API_URL : null) ||
      (!isLocalAddress(process.env.API_BASE_URL) ? process.env.API_BASE_URL : null) ||
      extra.API_BASE_URL ||
      DEFAULT_PRODUCTION_URL;
    apiBaseUrl = candidateUrl;
  }

  return {
    APP_ENV: appEnv,
    API_BASE_URL: apiBaseUrl.replace(/\/$/, ''),
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
    IS_DEV: isDev,
    GOOGLE_WEB_CLIENT_ID: '876129590251-lok6bi4ut8f2nhl63hh79mghd1ccuf6j.apps.googleusercontent.com',
    GOOGLE_ANDROID_CLIENT_ID: '876129590251-34k98ip577urgvt89s5hrihgg3aigme6.apps.googleusercontent.com',
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra.GOOGLE_IOS_CLIENT_ID || '',
  };
};

export const env = getEnv();
