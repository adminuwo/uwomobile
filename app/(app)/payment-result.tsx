import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react-native';
import { Text } from '../../src/components/Text';
import { Screen } from '../../src/components/Screen';
import { colors } from '../../src/theme/colors';
import { useSessionStore } from '../../src/stores/sessionStore';

WebBrowser.maybeCompleteAuthSession();

export default function AppPaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; message?: string; order_id?: string }>();
  const { initialize } = useSessionStore();

  const status = (params.status || 'success').toLowerCase();
  const isSuccess = status === 'success';
  const isCancelled = status === 'cancelled';
  const errorMessage = params.message || 'The payment could not be processed.';

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();

    if (isSuccess) {
      // Refresh profile data to reflect upgraded plan or wallet balance
      initialize().catch(() => {});

      // Auto redirect back to plans screen after 2.5 seconds
      const timer = setTimeout(() => {
        router.replace('/(app)/plans');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, initialize, router]);

  const handleContinue = () => {
    router.replace('/(app)/plans');
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.card}>
          {isSuccess ? (
            <>
              <View style={styles.iconCircleSuccess}>
                <CheckCircle2 size={56} color="#059669" />
              </View>

              <Text style={styles.title}>Payment Successful! 🎉</Text>
              <Text style={styles.subtitle}>
                Thank you! Your workspace subscription has been updated successfully.
              </Text>

              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>✓ INSTANTLY ACTIVATED</Text>
              </View>

              <ActivityIndicator size="small" color="#059669" style={styles.loader} />
              <Text style={styles.redirectHint}>Redirecting to workspace plans...</Text>
            </>
          ) : isCancelled ? (
            <>
              <View style={styles.iconCircleWarning}>
                <AlertTriangle size={56} color="#d97706" />
              </View>

              <Text style={styles.title}>Payment Cancelled</Text>
              <Text style={styles.subtitle}>
                The checkout session was cancelled. No charges were made to your account.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.iconCircleError}>
                <XCircle size={56} color="#dc2626" />
              </View>

              <Text style={styles.title}>Payment Incomplete</Text>
              <Text style={styles.subtitle}>{errorMessage}</Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, !isSuccess && styles.buttonSecondary]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isSuccess ? 'Return to Plans' : 'Try Again'}
            </Text>
            <ArrowRight size={18} color="#ffffff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a120d',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#16271c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircleSuccess: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircleWarning: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircleError: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: 10,
  },
  redirectHint: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#059669',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
