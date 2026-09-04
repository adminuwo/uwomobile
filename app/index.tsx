import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useSessionStore } from '../src/stores/sessionStore';
import { useTheme } from '../src/theme';

export default function IndexScreen() {
  const { status } = useSessionStore();
  const { colors } = useTheme();

  if (status === 'authenticated') {
    return <Redirect href="/(app)/home" />;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

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
