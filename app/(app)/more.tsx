import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { useTranslation } from '../../src/i18n';
import { 
  Bell,
  ChevronRight,
  Palette,
  Globe,
  LogOut,
} from 'lucide-react-native';
import { useSessionStore } from '../../src/stores/sessionStore';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, destructive }: MenuItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: destructive ? colors.error + '20' : colors.surface }]}>
        {icon}
      </View>
      <View style={styles.menuItemContent}>
        <Text variant="body" weight="medium" color={destructive ? colors.error : colors.textPrimary}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.textMuted} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={colors.borderMuted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { colors, mode } = useTheme();
  const { t, currentLanguageInfo } = useTranslation();
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      t('account.logout'),
      t('account.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('account.logout'), style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const getThemeSubtitle = () => {
    if (mode === 'custom') return t('appearance.custom');
    if (mode === 'dark') return t('appearance.dark');
    return t('appearance.light');
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title={t('navigation.menu')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          {t('account.sectionTitle')}
        </Text>
        <Card style={styles.sectionCard}>
          <MenuItem
            icon={<Bell size={20} color={colors.textPrimary} />}
            title={t('account.notifications')}
            subtitle={t('account.notificationsDesc')}
            onPress={() => {
              Alert.alert(t('account.notifications'), t('account.notificationsDesc'));
            }}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<Palette size={20} color={colors.primary} />}
            title={t('account.appearance')}
            subtitle={getThemeSubtitle()}
            onPress={() => router.push('/(app)/appearance')}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<Globe size={20} color={colors.primary} />}
            title={t('account.language')}
            subtitle={`${currentLanguageInfo.name} (${currentLanguageInfo.nativeName})`}
            onPress={() => router.push('/(app)/language')}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<LogOut size={20} color={colors.error} />}
            title={t('account.logout')}
            destructive
            onPress={handleLogout}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  }
});
