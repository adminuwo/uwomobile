import React from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import { env } from '../../src/config/env';
import { Moon, Sun, LogOut, Shield, Globe, Server, Bell, ChevronRight } from 'lucide-react-native';

export default function MoreScreen() {
  const router = useRouter();
  const { colors, mode, toggleTheme, spacing, radius } = useTheme();
  const { user, logout } = useSessionStore();
  const brand = useBrandStore((state) => state.brand);

  const userName = user?.name || user?.email?.split('@')[0] || 'Account User';
  const userEmail = user?.email || 'user@uwoconnect.com';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Settings & Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <Avatar name={userName} size="lg" isOnline />
            <View style={styles.userInfo}>
              <Text variant="h3" weight="bold">
                {userName}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {userEmail}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Shield size={12} color={colors.primary} style={styles.roleIcon} />
                <Text variant="caption" color={colors.primary} weight="bold">
                  Role: {user?.role || 'CLIENT'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Preferences Section */}
        <Text variant="label" style={styles.sectionLabel}>
          Preferences
        </Text>

        <Card style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              {mode === 'dark' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.warning} />
              )}
              <View style={styles.optionTextGroup}>
                <Text variant="body" weight="medium">
                  Appearance
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  {mode === 'dark' ? 'Dark Emerald Mode' : 'Light Clean Mode'}
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.borderMuted, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* System & Brand Information */}
        <Text variant="label" style={styles.sectionLabel}>
          System Connection
        </Text>

        <Card style={styles.systemCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Globe size={18} color={colors.textMuted} />
              <Text variant="body" style={styles.infoText}>
                Brand Domain
              </Text>
            </View>
            <Text variant="caption" color={colors.primary} weight="bold">
              {brand.brand_name || 'UwoConnect'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Server size={18} color={colors.textMuted} />
              <Text variant="body" style={styles.infoText}>
                API Endpoint
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.endpointText}>
              {env.API_BASE_URL}
            </Text>
          </View>
        </Card>

        {/* Logout Action */}
        <Button
          title="Sign Out of Mobile App"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          leftIcon={<LogOut size={18} color={colors.textInverse} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleIcon: {
    marginRight: 4,
  },
  sectionLabel: {
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionCard: {
    marginBottom: 16,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextGroup: {
    marginLeft: 12,
  },
  systemCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 10,
  },
  endpointText: {
    maxWidth: 180,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  logoutBtn: {
    marginTop: 8,
  },
});
