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
export const LIVE_BACKEND_URL = 'https://aisaconnectback-anaqbuapb6c6apgy.centralindia-01.azurewebsites.net';
const DEFAULT_PRODUCTION_URL = LIVE_BACKEND_URL;

const getDynamicApiUrl = (): string => {
  return LIVE_BACKEND_URL;
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
