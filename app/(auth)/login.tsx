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
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';


export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { login, loginWithApple, isLoading, error, clearError } = useSessionStore();
  const { promptGoogleLogin, isGoogleLoading, googleError, clearGoogleError } = useGoogleAuth();
  const brand = useBrandStore((state) => state.brand);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleLogin = async () => {
    clearError();
    clearGoogleError();
    setValidationError('');

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
      router.replace('/(app)/home');
    }
  };

  const handleGooglePress = async () => {
    clearError();
    setValidationError('');
    await promptGoogleLogin();
  };

  const handleApplePress = async () => {
    clearError();
    clearGoogleError();
    setValidationError('');
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

              {/* Apple */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleApplePress}
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
                {isAppleLoading ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <Svg viewBox="0 0 814 1000" width={18} height={18} fill={colors.textPrimary}>
                    <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-47.4-155.5-127.4C46 790.8 0 663 0 541.8c0-207.8 135.4-318 269-318 69.4 0 126.9 45.3 170.8 45.3 42 0 109.2-47.4 185.6-47.4 29.8 0 108.2 2.6 168.5 80.1zm-84.7-217.5c39.5-46.8 67.8-112.5 67.8-178.2 0-9-1-18.1-2.6-25.8-64.3 2.6-140.7 43.4-186.5 93.6-36.5 40.8-70.3 106.5-70.3 173.1 0 10.3 1.9 20.6 2.6 23.9 3.9.6 10.3 1.3 16.6 1.3 57.8 0 129.8-38.8 172.4-87.9z" />
                  </Svg>
                )}
                <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginLeft: 8 }}>
                  Apple
                </Text>
              </TouchableOpacity>
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

            {/* Legal Notice */}
            <View style={[styles.legalNoticeContainer, { backgroundColor: `${colors.border}25` }]}>
              <Text variant="caption" color={colors.textMuted} align="center" style={styles.legalNoticeText}>
                By signing in, you agree to our{' '}
                <Text
                  variant="caption"
                  weight="bold"
                  color={colors.primary}
                  onPress={() => router.push('/(auth)/terms')}
                >
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text
                  variant="caption"
                  weight="bold"
                  color={colors.primary}
                  onPress={() => router.push('/(auth)/privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
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
    marginBottom: 16,
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
