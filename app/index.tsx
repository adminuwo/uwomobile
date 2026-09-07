import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useSessionStore } from '../src/stores/sessionStore';

export default function IndexScreen() {
  const { status } = useSessionStore();

  if (status === 'authenticated') {
    return <Redirect href="/(app)/home" />;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="small" color="#10b981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
});
