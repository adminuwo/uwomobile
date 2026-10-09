import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Input } from '../../src/components/Input';
import { resolveValidImageUri } from '../../src/utils/imageUri';
import { Button } from '../../src/components/Button';
import { GoogleIcon } from '../../src/components/GoogleIcon';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth';
import { useTheme } from '../../src/theme';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppleIcon } from '../../src/components/AppleIcon';
import { legalApi } from '../../src/api/legal';
import { LEGAL_CONSTANTS } from '../../src/constants/legal';

import * as WebBrowser from 'expo-web-browser';
import { APPLE_LEGAL_LINKS } from '../../src/config/iapConfig';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { login, loginWithApple, isLoading, error, clearError } = useSessionStore();
  const { promptGoogleLogin, isGoogleLoading, googleError, clearGoogleError } = useGoogleAuth();
  const brand = useBrandStore((state) => state.brand);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleLogin = async () => {
    clearError();
    clearGoogleError();
    setValidationError('');

    if (!acceptedLegal) {
      setValidationError('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      try {
        await legalApi.submitConsent({
          terms_accepted: true,
          terms_version: LEGAL_CONSTANTS.TERMS_VERSION,
          privacy_accepted: true,
          privacy_version: LEGAL_CONSTANTS.PRIVACY_VERSION,
        });
      } catch (e) {
        console.warn('[Consent] Legal record submit notice:', e);
      }
      router.replace('/(app)/home');
    }
  };

  const handleGooglePress = async () => {
    clearError();
    setValidationError('');

    if (!acceptedLegal) {
      setValidationError('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }

    await promptGoogleLogin();
  };

  const handleApplePress = async () => {
    clearError();
    clearGoogleError();
    setValidationError('');

    if (!acceptedLegal) {
      setValidationError('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }

    setIsAppleLoading(true);

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setValidationError(
          Platform.OS === 'ios'
            ? 'Apple Sign-In is not available on this device. Please sign in to your Apple Account in iOS Settings.'
            : 'Apple Sign-In is only supported on iOS devices.'
        );
        return;
      }

      const result = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!result?.identityToken) {
        setValidationError('Apple Sign-In failed: No identity token received.');
        return;
      }

      const fullName = result.fullName
        ? [result.fullName.givenName, result.fullName.familyName].filter(Boolean).join(' ')
        : undefined;

      const success = await loginWithApple(result.identityToken, {
        name: fullName || (result.email ? result.email.split('@')[0] : undefined),
      });

      if (success) {
        try {
          await legalApi.submitConsent({
            terms_accepted: true,
            terms_version: LEGAL_CONSTANTS.TERMS_VERSION,
            privacy_accepted: true,
            privacy_version: LEGAL_CONSTANTS.PRIVACY_VERSION,
          });
        } catch (e) {
          console.warn('[Consent] Legal record submit notice:', e);
        }
        router.replace('/(app)/home');
      }
    } catch (e: any) {
      console.log('[AppleAuth] Error:', e);
      if (
        e?.code === 'ERR_CANCELED' ||
        e?.code === 'ERR_REQUEST_CANCELED' ||
        e?.message?.toLowerCase?.().includes('cancel')
      ) {
        // User cancelled Apple sign-in dialog
      } else {
        setValidationError(e?.message || 'Apple Sign-In failed. Please try again.');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const displayError = validationError || error || googleError;
  const isActionLoading = isLoading || isGoogleLoading || isAppleLoading;

  return (
    <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Section */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {resolveValidImageUri(brand.logo_url) ? (
                <Image
                  source={{ uri: resolveValidImageUri(brand.logo_url)! }}
                  style={styles.logoImage}
                />
              ) : (
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImage}
                />
              )}
            </View>
            <Text variant="h1" weight="bold" align="center" style={styles.brandTitle}>
              {brand.brand_name || 'UWO Connect'}
            </Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.brandSubtitle}>
              {brand.tagline || 'Unified Communication & Business Automation'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text variant="h1" weight="bold" align="center" style={[styles.formTitle, { color: colors.primary }]}>
                Sign In
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center" style={styles.formSubtitle}>
                Enter your email and password to access your workspace.
              </Text>
            </View>

            {displayError ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                <AlertCircle size={18} color={colors.error} style={styles.errorIcon} />
                <Text variant="caption" color={colors.error} style={styles.errorText}>
                  {displayError}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              placeholder="name@company.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (validationError) setValidationError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (validationError) setValidationError('');
              }}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />

            {/* Forgot Password link */}
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text variant="caption" weight="semibold" color={colors.primary}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mandatory Terms & Privacy Consent Checkbox */}
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => {
                setAcceptedLegal(!acceptedLegal);
                if (validationError) setValidationError('');
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: acceptedLegal
                      ? colors.primary
                      : validationError && !acceptedLegal
                        ? colors.error
                        : colors.border,
                    backgroundColor: acceptedLegal ? colors.primary : colors.surface,
                  },
                ]}
              >
                {acceptedLegal && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>

              <Text style={[styles.consentText, { color: colors.textSecondary }]}>
                I have read and agree to the{' '}
                <Text
                  style={[styles.consentLink, { color: colors.primary }]}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    router.push('/(auth)/terms');
                  }}
                >
                  Terms
                </Text>
                {Platform.OS === 'ios' ? (
                  <>
                    {', '}
                    <Text
                      style={[styles.consentLink, { color: colors.primary }]}
                      onPress={(e: any) => {
                        e?.stopPropagation?.();
                        WebBrowser.openBrowserAsync(APPLE_LEGAL_LINKS.APPLE_STANDARD_EULA_URL);
                      }}
                    >
                      Apple EULA
                    </Text>
                  </>
                ) : null}
                {' & '}
                <Text
                  style={[styles.consentLink, { color: colors.primary }]}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    router.push('/(auth)/privacy');
                  }}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isActionLoading}
              variant="primary"
              fullWidth
              rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
              style={styles.submitBtn}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <View style={[styles.dividerPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="caption" color={colors.textMuted} style={styles.dividerText}>
                  OR CONTINUE WITH
                </Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Buttons Row */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGooglePress}
                disabled={isActionLoading}
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: isActionLoading ? 0.6 : 1,
                  },
                ]}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <GoogleIcon size={20} />
                )}
                <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginLeft: 8 }}>
                  Google
                </Text>
              </TouchableOpacity>

              {/* Apple — Official Apple HIG "White with outline" Button */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleApplePress}
                  disabled={isActionLoading}
                  style={[
                    styles.socialButton,
                    {
                      backgroundColor: '#FFFFFF',
                      borderColor: '#000000',
                      borderWidth: 1,
                      opacity: isActionLoading ? 0.6 : 1,
                    },
                  ]}
                >
                  {isAppleLoading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <>
                      <AppleIcon size={18} color="#000000" />
                      <Text variant="body" weight="bold" style={{ marginLeft: 8, color: '#000000' }}>
                        Sign in with Apple
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>


            {/* Create Account link */}
            <View style={styles.registerLinkContainer}>
              <Text variant="caption" color={colors.textSecondary}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text variant="caption" weight="bold" color={colors.primary}>
                  Register now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  brandTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandSubtitle: {
    maxWidth: 290,
    fontSize: 12,
  },
  card: {
    padding: 22,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: -4,
    marginBottom: 14,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  consentLink: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 2,
    height: 50,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    position: 'relative',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  dividerText: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  legalNoticeContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  legalNoticeText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
