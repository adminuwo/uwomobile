import 'react-native-gesture-handler';
import React, { useEffect, Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '../src/config/queryClient';
import { ThemeProvider } from '../src/theme';
import { useSessionStore } from '../src/stores/sessionStore';
import { useBrandStore } from '../src/stores/brandStore';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[App Crash ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text variant="h2" weight="bold" color="#ef4444" style={styles.errorTitle}>
            UwoConnect Launch Error
          </Text>
          <Text variant="caption" color="#a1a1aa" style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected startup error occurred.'}
          </Text>
          <Button
            title="Restart App"
            onPress={() => this.setState({ hasError: false, error: null })}
            variant="primary"
            style={styles.restartBtn}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutNav() {
  const { initialize, status } = useSessionStore();
  const { fetchBrandConfig } = useBrandStore();

  useEffect(() => {
    // Initial app launch setup
    fetchBrandConfig().catch(() => {});
    initialize().catch(() => {});

    // Fallback safety: hide splash screen after 1.5s no matter what
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [initialize, fetchBrandConfig]);

  useEffect(() => {
    if (status !== 'initializing') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a120d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    marginBottom: 10,
  },
  errorMessage: {
    marginBottom: 20,
    textAlign: 'center',
  },
  restartBtn: {
    minWidth: 140,
  },
});
