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

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { login, isLoading, error, clearError } = useSessionStore();
  const { promptGoogleLogin, isGoogleLoading, googleError, clearGoogleError } = useGoogleAuth();
  const brand = useBrandStore((state) => state.brand);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

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

  const displayError = validationError || error || googleError;
  const isActionLoading = isLoading || isGoogleLoading;

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
              {brand.brand_name || 'UwoConnect'}
            </Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.brandSubtitle}>
              {brand.tagline || 'Unified Communication & Business Automation'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
            <Text variant="h2" weight="bold" style={styles.formTitle}>
              Sign In
            </Text>
            <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
              Enter your email and password to continue.
            </Text>

            {displayError ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                <AlertCircle size={18} color={colors.error} style={styles.errorIcon} />
                <Text variant="caption" color={colors.error} style={styles.errorText}>
                  {displayError}
                </Text>
              </View>
            ) : null}

            {/* Google Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGooglePress}
              disabled={isActionLoading}
              style={[
                styles.googleButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  opacity: isActionLoading ? 0.6 : 1,
                },
              ]}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.googleIconContainer} />
              ) : (
                <View style={styles.googleIconContainer}>
                  <GoogleIcon size={20} />
                </View>
              )}
              <Text variant="body" weight="semibold" color={colors.textPrimary}>
                {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text variant="caption" color={colors.textMuted} style={styles.dividerText}>
                OR CONTINUE WITH EMAIL
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

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
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text variant="caption" color={colors.textMuted} align="center">
              Secured by UwoConnect • v1.0.0
            </Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  brandTitle: {
    marginBottom: 4,
  },
  brandSubtitle: {
    maxWidth: 280,
  },
  card: {
    padding: 20,
    borderWidth: 1,
  },
  formTitle: {
    marginBottom: 4,
  },
  formSubtitle: {
    marginBottom: 20,
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
  submitBtn: {
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 50,
  },
  googleIconContainer: {
    marginRight: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
  },
});
