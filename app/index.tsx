import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessionStore } from '../src/stores/sessionStore';

export default function IndexScreen() {
  const { status } = useSessionStore();
  const insets = useSafeAreaInsets();
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (minTimeElapsed && status === 'authenticated') {
    return <Redirect href="/(app)/home" />;
  }

  if (minTimeElapsed && status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerSection}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
        />
        <ActivityIndicator size="small" color="#10b981" style={styles.spinner} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
        <Text style={styles.poweredByLabel}>POWERED BY</Text>
        <Text style={styles.poweredByBrand}>UWO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  spinner: {
    marginTop: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poweredByLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  poweredByBrand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#10b981',
  },
});

