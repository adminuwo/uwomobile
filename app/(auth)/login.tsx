import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { login, isLoading, error, clearError } = useSessionStore();
  const brand = useBrandStore((state) => state.brand);

  const [email, setEmail] = useState('abha@uwo24.com');
  const [password, setPassword] = useState('admin123');
  const [validationError, setValidationError] = useState('');

  const handleLogin = async () => {
    clearError();
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

  const displayError = validationError || error;

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
              <Image
                source={brand.logo_url ? { uri: brand.logo_url } : require('../../assets/icon.png')}
                style={styles.logoImage}
              />
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
              Sign In to Workspace
            </Text>
            <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
              Enter your credentials to access your mobile CRM and inbox.
            </Text>

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

            <Button
              title="Sign In to Workspace"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              fullWidth
              rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
              style={styles.submitBtn}
            />
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text variant="caption" color={colors.textMuted} align="center">
              Secured by UwoConnect Enterprise Shield • v1.0.0
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
  footer: {
    marginTop: 32,
  },
});
