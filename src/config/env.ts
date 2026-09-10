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

const DEFAULT_PRODUCTION_URL = 'https://uwoconnectforrb-743928421487.asia-south1.run.app';

const getDynamicApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = 
    Constants.expoConfig?.hostUri || 
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost || 
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000`;
    }
  }

  if (Constants.linkingUri) {
    try {
      const parsed = new URL(Constants.linkingUri);
      if (parsed.hostname && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return `http://${parsed.hostname}:8000`;
      }
    } catch {}
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://192.168.29.183:8000';
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
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID === '876129590251-lok6bi4ut8f2nhl63hh79mghd1ccuf6j.apps.googleusercontent.com' 
      ? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID 
      : '876129590251-lok6bi4ut8f2nhl63hh79mghd1ccuf6j.apps.googleusercontent.com',
    GOOGLE_ANDROID_CLIENT_ID: '876129590251-34k98ip577urgvt89s5hrihgg3aigme6.apps.googleusercontent.com',
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra.GOOGLE_IOS_CLIENT_ID || '',
  };
};

export const env = getEnv();
