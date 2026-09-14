import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Call maybeCompleteAuthSession immediately when module loads
WebBrowser.maybeCompleteAuthSession();

export default function ExpoAuthSessionHandler() {
  const router = useRouter();

  useEffect(() => {
    // Attempt completing any active auth session
    WebBrowser.maybeCompleteAuthSession();

    // Give a brief moment for the auth hook to process token, then redirect to login or home
    const timeout = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
