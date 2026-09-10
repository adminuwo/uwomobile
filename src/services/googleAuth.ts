import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { env } from '../config/env';

// Ensures WebBrowser auth session completes properly on web & native redirects
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthConfig {
  clientId?: string;
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
  scopes: string[];
  redirectUri: string;
}

import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getGoogleAuthConfig = (): GoogleAuthConfig => {
  const isAndroid = Platform.OS === 'android';
  const clientId = isAndroid && env.GOOGLE_ANDROID_CLIENT_ID 
    ? env.GOOGLE_ANDROID_CLIENT_ID 
    : env.GOOGLE_WEB_CLIENT_ID;

  const redirectUri = makeRedirectUri({
    native: isAndroid && env.GOOGLE_ANDROID_CLIENT_ID
      ? `com.googleusercontent.apps.${env.GOOGLE_ANDROID_CLIENT_ID.split('.')[0]}:/oauthredirect`
      : `${Application.applicationId || 'com.uwo.uwoconnect'}:/oauthredirect`,
  });

  return {
    clientId,
    webClientId: env.GOOGLE_WEB_CLIENT_ID,
    androidClientId: env.GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: env.GOOGLE_IOS_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  };
};
