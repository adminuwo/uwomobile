import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { authApi } from '../../src/api/auth';
import { secureStorage } from '../../src/services/secureStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { Shield, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react-native';

export default function QrAuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ session_id?: string; token?: string; code?: string }>();
  const setUser = useSessionStore((state) => state.setUser);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sessionId = params.session_id || params.token || params.code || '';

  const processQrAuthentication = async () => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No valid QR authentication reference found in link.');
      return;
    }

    try {
      setStatus('verifying');
      setErrorMessage('');

      // Consume one-time QR session with backend
      const response = await authApi.consumeQrSession(sessionId);

      if (!response || !response.token) {
        throw new Error('Authentication payload missing token');
      }

      // Store JWT token securely in Expo SecureStore
      await secureStorage.setAccessToken(response.token);

      // Update Zustand Session Store
      if (response.user) {
        setUser(response.user);
      }

      setStatus('success');

      // Auto-navigate to Mobile Home/Dashboard
      setTimeout(() => {
        router.replace('/(app)/home');
      }, 1200);
    } catch (err: any) {
      console.error('[QR Auth Handoff Error]', err);
      setStatus('error');
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'This QR authentication session has expired or is no longer valid.';
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    processQrAuthentication();
  }, [sessionId]);

  return (
    <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card variant="default" style={styles.card}>
          {status === 'verifying' && (
            <View style={styles.stateBox}>
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Shield size={36} color={colors.primary} />
              </View>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 16 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ textAlign: 'center' }}>
                Authenticating Device Handoff...
              </Text>
              <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 6 }}>
                Verifying secure one-time session with UwoConnect Server. Please wait.
              </Text>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.stateBox}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle2 size={40} color="#059669" />
              </View>
              <Text variant="h2" weight="bold" color={colors.textPrimary} style={{ textAlign: 'center', marginTop: 14 }}>
                Authentication Successful!
              </Text>
              <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 6 }}>
                Your mobile session has been securely established. Redirecting to home...
              </Text>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.stateBox}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                <ShieldAlert size={40} color="#EF4444" />
              </View>

              <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ textAlign: 'center', marginTop: 14 }}>
                QR Authentication Failed
              </Text>

              <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
                {errorMessage}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary }]}
                  onPress={processQrAuthentication}
                >
                  <RefreshCw size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Try Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    Login Normally
                  </Text>
                  <ArrowRight size={14} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionRow: {
    width: '100%',
    gap: 10,
    marginTop: 24,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
  },
});
