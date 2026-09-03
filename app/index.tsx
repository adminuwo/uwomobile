import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../src/stores/sessionStore';
import { useTheme } from '../src/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { status } = useSessionStore();
  const { colors } = useTheme();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(app)/home');
    } else if (status === 'unauthenticated') {
      router.replace('/(auth)/login');
    }
  }, [status, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
