import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { env } from '../config/env';
import { useSessionStore } from '../stores/sessionStore';

WebBrowser.maybeCompleteAuthSession();

export interface UseGoogleAuthReturn {
  promptGoogleLogin: () => Promise<void>;
  isGoogleLoading: boolean;
  googleError: string | null;
  clearGoogleError: () => void;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const router = useRouter();
  const { loginWithGoogle } = useSessionStore();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const promptGoogleLogin = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      const clientId = env.GOOGLE_WEB_CLIENT_ID;
      const proxyRedirectUri = 'https://auth.expo.io/@uwo/uwo-connect';
      
      const returnUrl = makeRedirectUri({
        scheme: 'uwoconnect',
        path: 'expo-auth-session',
      });

      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString() + Date.now().toString()
      );
      const state = Math.random().toString(36).substring(2, 15);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: proxyRedirectUri,
        response_type: 'token id_token',
        scope: 'openid profile email',
        nonce,
        state,
        prompt: 'select_account',
      });

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      const startUrl = `https://auth.expo.io/@uwo/uwo-connect/start?${new URLSearchParams({
        authUrl: googleAuthUrl,
        returnUrl,
      }).toString()}`;

      console.log('[GoogleAuth] Initiating Auth via Proxy Start URL:', startUrl);

      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
      console.log('[GoogleAuth] WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        // Parse URL fragments and query params
        const hashIdx = result.url.indexOf('#');
        const queryIdx = result.url.indexOf('?');

        let hashParams = new URLSearchParams();
        if (hashIdx !== -1) {
          hashParams = new URLSearchParams(result.url.substring(hashIdx + 1));
        }

        let queryParams = new URLSearchParams();
        if (queryIdx !== -1) {
          const queryPart = hashIdx !== -1 && hashIdx > queryIdx 
            ? result.url.substring(queryIdx + 1, hashIdx) 
            : result.url.substring(queryIdx + 1);
          queryParams = new URLSearchParams(queryPart);
        }

        const idToken =
          hashParams.get('id_token') ||
          queryParams.get('id_token') ||
          hashParams.get('access_token') ||
          queryParams.get('access_token');

        if (!idToken) {
          const errDesc = hashParams.get('error_description') || queryParams.get('error_description') || hashParams.get('error') || queryParams.get('error');
          throw new Error(errDesc || 'No authentication token received from Google.');
        }

        console.log('[GoogleAuth] Successfully received token, authenticating with backend...');
        const success = await loginWithGoogle(idToken);
        if (success) {
          router.replace('/(app)/home');
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('[GoogleAuth] User cancelled or dismissed login flow.');
      } else {
        throw new Error('Google Sign-In was not completed.');
      }
    } catch (err: any) {
      console.error('[GoogleAuthHook] Sign-in error:', err);
      setGoogleError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const clearGoogleError = () => setGoogleError(null);

  return {
    promptGoogleLogin,
    isGoogleLoading,
    googleError,
    clearGoogleError,
  };
}
