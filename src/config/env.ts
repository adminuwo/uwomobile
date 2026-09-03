import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface EnvConfig {
  APP_ENV: AppEnvironment;
  API_BASE_URL: string;
  APP_VERSION: string;
  IS_DEV: boolean;
}

const getLocalHostApiUrl = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator mapping to host machine localhost
    return 'http://10.0.2.2:8000';
  }
  // iOS simulator or web
  return 'http://127.0.0.1:8000';
};

const getEnv = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra || {};
  const processEnv = process.env;

  const appEnv = (processEnv.EXPO_PUBLIC_APP_ENV || extra.APP_ENV || 'development') as AppEnvironment;
  const isDev = appEnv === 'development';

  let apiBaseUrl = processEnv.EXPO_PUBLIC_API_BASE_URL || extra.API_BASE_URL;

  if (!apiBaseUrl) {
    if (isDev) {
      apiBaseUrl = getLocalHostApiUrl();
    } else {
      apiBaseUrl = 'https://uwoconnectforrb-743928421487.asia-south1.run.app';
    }
  }

  return {
    APP_ENV: appEnv,
    API_BASE_URL: apiBaseUrl.replace(/\/$/, ''),
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
    IS_DEV: isDev,
  };
};

export const env = getEnv();
