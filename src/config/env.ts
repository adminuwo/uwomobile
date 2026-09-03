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

const getLocalHostApiUrl = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator mapping to host machine localhost
    return 'http://192.168.29.238:8000'; // Override for physical device
  }
  // iOS simulator or web
  return 'http://127.0.0.1:8000';
};

const getEnv = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra || {};
  const processEnv = process.env;

  // __DEV__ is false in compiled production/release APK builds
  const isDevelopmentBuild = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  const appEnv = (processEnv.EXPO_PUBLIC_APP_ENV || extra.APP_ENV || (isDevelopmentBuild ? 'development' : 'production')) as AppEnvironment;
  const isDev = isDevelopmentBuild && appEnv === 'development';

  let apiBaseUrl = 'http://192.168.29.238:8083'; // FORCED IP FOR TESTING (VIA NODE.JS PROXY)
  
  // if (!apiBaseUrl) {
  //   if (isDev) {
  //     apiBaseUrl = getLocalHostApiUrl();
  //   } else {
  //     apiBaseUrl = DEFAULT_PRODUCTION_URL;
  //   }
  // }

  return {
    APP_ENV: appEnv,
    API_BASE_URL: apiBaseUrl.replace(/\/$/, ''),
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
    IS_DEV: isDev,
  };
};

export const env = getEnv();
