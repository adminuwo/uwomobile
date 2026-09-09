import 'react-native-gesture-handler';
import React, { useEffect, Component, ReactNode } from 'react';
import { Text as RNText, View, StyleSheet, TouchableOpacity, LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '../src/config/queryClient';
import { ThemeProvider, useTheme } from '../src/theme';
import { useSessionStore } from '../src/stores/sessionStore';
import { useBrandStore } from '../src/stores/brandStore';

// Suppress routine background dev warnings from interrupting the UI
LogBox.ignoreLogs([
  'WebSocket error:',
  'Cannot connect to Metro',
  'Software caused connection abort',
  'Failed to fetch contacts:',
  'failed to fetch contacts:',
  /fetch contacts/i,
  /Authentication credentials/i,
  /Session expired/i,
  /HTTP_401/i,
  /AxiosError/i,
  /Network connection lost/i,
  /Network request failed/i,
  /Possible unhandled promise rejection/i,
  /inboxApi/i,
  /ReactImageView/i,
  /doesn't exist/i,
]);


// Hide native splash screen quickly so JS white splash screen is shown
SplashScreen.hideAsync().catch(() => {});

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
          <RNText style={[styles.errorTitle, { fontSize: 24, fontWeight: 'bold', color: '#ef4444' }]}>
            UwoConnect Launch Error
          </RNText>
          <RNText style={[styles.errorMessage, { fontSize: 13, color: '#a1a1aa' }]}>
            {this.state.error?.message || 'An unexpected startup error occurred.'}
          </RNText>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={[styles.restartBtn, { backgroundColor: '#10b981', padding: 12, borderRadius: 8 }]}
          >
            <RNText style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Restart App</RNText>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

import { I18nProvider, useTranslation } from '../src/i18n';

function RootLayoutNav() {
  const { initialize, status } = useSessionStore();
  const { fetchBrandConfig } = useBrandStore();
  const { syncWithServer: syncTheme } = useTheme();
  const { syncWithServer: syncI18n } = useTranslation();

  useEffect(() => {
    // Ensure native splash screen is hidden immediately so white JS screen displays
    SplashScreen.hideAsync().catch(() => {});
    fetchBrandConfig().catch(() => {});
    initialize().catch(() => {});
  }, [initialize, fetchBrandConfig]);

  useEffect(() => {
    if (status !== 'initializing') {
      SplashScreen.hideAsync().catch(() => {});
    }
    if (status === 'authenticated') {
      syncTheme().catch(() => {});
      syncI18n().catch(() => {});
    }
  }, [status, syncTheme, syncI18n]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nProvider>
              <RootLayoutNav />
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
