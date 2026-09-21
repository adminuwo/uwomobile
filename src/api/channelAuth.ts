import * as WebBrowser from 'expo-web-browser';
import { apiClient } from './client';

// Ensure any existing auth sessions complete properly
WebBrowser.maybeCompleteAuthSession();

export const META_CONFIG = {
  APP_ID: process.env.EXPO_PUBLIC_META_APP_ID || '991147863536661',
  WHATSAPP_CONFIG_ID: process.env.EXPO_PUBLIC_WHATSAPP_CONFIG_ID || '1048515390903125',
  REDIRECT_URI: 'https://uwoconnect.aisa24.com/client/channels',
  API_VERSION: 'v20.0',
};

export interface MetaOnboardingResult {
  success: boolean;
  data?: any;
  error?: string;
  cancelled?: boolean;
}

/**
 * Extracts a query parameter value safely from a redirect URL
 */
function extractQueryParam(url: string, paramName: string): string | null {
  try {
    const regex = new RegExp(`[?&]${paramName}=([^&#]+)`);
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export const channelAuthApi = {
  /**
   * Starts the official Meta WhatsApp Business Embedded Signup via In-App Browser.
   * Intercepts authorization code and exchanges it through the backend API.
   */
  async startWhatsAppMetaOnboarding(): Promise<MetaOnboardingResult> {
    try {
      const extras = JSON.stringify({
        setup: {},
        sessionInfoVersion: '3',
        featureType: 'whatsapp_business_app_onboarding',
      });

      const redirectUri = META_CONFIG.REDIRECT_URI;
      const oauthUrl = `https://www.facebook.com/${META_CONFIG.API_VERSION}/dialog/oauth?client_id=${META_CONFIG.APP_ID}&config_id=${META_CONFIG.WHATSAPP_CONFIG_ID}&response_type=code&override_default_response_type=true&extras=${encodeURIComponent(extras)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=whatsapp`;

      console.log('[channelAuthApi] Opening Meta WhatsApp dialog:', oauthUrl);
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('[channelAuthApi] WhatsApp OAuth session success callback:', result.url);

        const errorParam = extractQueryParam(result.url, 'error');
        const errorDesc = extractQueryParam(result.url, 'error_description');
        if (errorParam) {
          return {
            success: false,
            error: errorDesc || errorParam || 'Meta authentication was denied or cancelled.',
          };
        }

        const code = extractQueryParam(result.url, 'code');
        if (!code) {
          return {
            success: false,
            error: 'No authorization code was returned by Meta.',
          };
        }

        console.log('[channelAuthApi] Exchanging code with backend endpoint...');
        const response = await apiClient.post<any>('/api/auth/whatsapp/embedded-signup', {
          code,
          redirect_uri: redirectUri,
        });

        return {
          success: true,
          data: response,
        };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('[channelAuthApi] Meta WhatsApp auth session cancelled by user');
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: false,
        error: 'Unexpected auth session outcome.',
      };
    } catch (err: any) {
      console.error('[channelAuthApi] startWhatsAppMetaOnboarding error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to complete WhatsApp onboarding with Meta.',
      };
    }
  },

  /**
   * Starts the official Meta Facebook Page & Messenger connection via In-App Browser.
   */
  async startFacebookMetaOnboarding(): Promise<MetaOnboardingResult> {
    try {
      const redirectUri = `${META_CONFIG.REDIRECT_URI}?state=facebook`;
      const oauthUrl = `https://www.facebook.com/${META_CONFIG.API_VERSION}/dialog/oauth?client_id=${META_CONFIG.APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_messaging&response_type=code&state=facebook`;

      console.log('[channelAuthApi] Opening Meta Facebook dialog:', oauthUrl);
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, META_CONFIG.REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        console.log('[channelAuthApi] Facebook OAuth session success callback:', result.url);

        const errorParam = extractQueryParam(result.url, 'error');
        const errorDesc = extractQueryParam(result.url, 'error_description');
        if (errorParam) {
          return {
            success: false,
            error: errorDesc || errorParam || 'Facebook permission was denied or cancelled.',
          };
        }

        const code = extractQueryParam(result.url, 'code');
        if (!code) {
          return {
            success: false,
            error: 'No authorization code returned for Facebook.',
          };
        }

        console.log('[channelAuthApi] Exchanging Facebook code with backend endpoint...');
        const response = await apiClient.post<any>('/api/auth/facebook/embedded-signup', {
          code,
          redirect_uri: redirectUri,
        });

        return {
          success: true,
          data: response,
        };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('[channelAuthApi] Meta Facebook auth session cancelled by user');
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: false,
        error: 'Unexpected auth session outcome.',
      };
    } catch (err: any) {
      console.error('[channelAuthApi] startFacebookMetaOnboarding error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to complete Facebook onboarding with Meta.',
      };
    }
  },

  /**
   * Starts the official Meta Instagram Direct & Business connection via In-App Browser.
   */
  async startInstagramMetaOnboarding(): Promise<MetaOnboardingResult> {
    try {
      const igClientId = process.env.EXPO_PUBLIC_INSTAGRAM_APP_ID || '1704328300882543';
      const redirectUri = META_CONFIG.REDIRECT_URI;
      const oauthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${igClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&state=instagram`;

      console.log('[channelAuthApi] Opening Instagram OAuth dialog:', oauthUrl);
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('[channelAuthApi] Instagram OAuth session success callback:', result.url);

        const errorParam = extractQueryParam(result.url, 'error');
        const errorDesc = extractQueryParam(result.url, 'error_description');
        if (errorParam) {
          return {
            success: false,
            error: errorDesc || errorParam || 'Instagram permission was denied or cancelled.',
          };
        }

        const code = extractQueryParam(result.url, 'code');
        if (!code) {
          return {
            success: false,
            error: 'No authorization code returned for Instagram.',
          };
        }

        console.log('[channelAuthApi] Exchanging Instagram code with backend endpoint...');
        const response = await apiClient.post<any>('/api/auth/instagram/oauth-callback', {
          code,
          redirect_uri: redirectUri,
        });

        return {
          success: true,
          data: response,
        };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('[channelAuthApi] Meta Instagram auth session cancelled by user');
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: false,
        error: 'Unexpected auth session outcome.',
      };
    } catch (err: any) {
      console.error('[channelAuthApi] startInstagramMetaOnboarding error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to complete Instagram onboarding with Meta.',
      };
    }
  },
};

