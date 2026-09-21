import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  ShieldCheck,
  Settings,
  LifeBuoy,
  Phone,
  Mail,
  FileSpreadsheet,
  CreditCard,
  Building2,
  HelpCircle,
  Laptop
} from 'lucide-react-native';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useContentStore } from '../../src/stores/contentStore';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, title, subtitle, badge, onPress, destructive }: MenuItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: destructive ? colors.error + '20' : colors.surface }]}>
        {icon}
      </View>
      <View style={styles.menuItemContent}>
        <View style={styles.titleRow}>
          <Text variant="body" weight="medium" color={destructive ? colors.error : colors.textPrimary}>
            {title}
          </Text>
          {badge && (
            <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
              <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 9 }}>
                {badge}
              </Text>
            </View>
          )}
        </View>
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
  const insets = useSafeAreaInsets();
  const user = useSessionStore((state) => state.user);
  const getContent = useContentStore((state) => state.getContent);
  const contentVersion = useContentStore((state) => state.version);

  const isAgencyUser = Boolean(
    user?.role === 'SUPERADMIN' || 
    (user?.client as any)?.is_agency || 
    user?.role === 'AGENCY'
  );

  const handleLogout = () => {
    Alert.alert(
      t('account.logout'),
      t('account.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('account.logout'),
          style: 'destructive',
          onPress: async () => {
            const { logoutAndResetSession } = require('../../src/services/sessionLifecycle');
            await logoutAndResetSession();
          },
        },
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
      <Header title={t('navigation.more')} showMenu={true} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
        
        {/* ── 1. MANAGEMENT SECTION ── */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          {t('drawer.management')}
        </Text>
        <Card style={styles.sectionCard}>
          <MenuItem
            icon={<FileSpreadsheet size={20} color={colors.primary} />}
            title={t('drawer.dailyWorkReports')}
            subtitle="Staff check-ins, tasks, and daily submission logs"
            onPress={() => router.push('/(app)/reports' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<CreditCard size={20} color="#059669" />}
            title={t('drawer.plansSubscription')}
            subtitle="Active plan tier, workspace limits & upgrade options"
            onPress={() => router.push('/(app)/plans' as any)}
          />
          {isAgencyUser && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <MenuItem
                icon={<Building2 size={20} color="#6366F1" />}
                title={t('drawer.agencyCommandHub')}
                subtitle="Manage sub-accounts, client workspaces and quotas"
                badge="AGENCY"
                onPress={() => router.push('/(app)/agency' as any)}
              />
            </>
          )}
        </Card>

        {/* ── 2. CENTER SECTION ── */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          {t('drawer.center')}
        </Text>
        <Card style={styles.sectionCard}>
          <MenuItem
            icon={<HelpCircle size={20} color="#F59E0B" />}
            title={t('drawer.supportDesk')}
            subtitle="Submit tickets, check issues & contact technical team"
            onPress={() => router.push('/(app)/support' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<ShieldCheck size={20} color="#059669" />}
            title="Legal & Compliance Center"
            subtitle="Terms & Conditions, Privacy Policy & Permissions"
            onPress={() => router.push('/(app)/legal' as any)}
          />
        </Card>

        {/* ── 3. SETTINGS & WORKSPACE PREFERENCES ── */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          SETTINGS & WORKSPACE
        </Text>
        <Card style={styles.sectionCard}>
          <MenuItem
            icon={<Settings size={20} color={colors.primary} />}
            title={t('drawer.settingsProfile')}
            subtitle="Organization profile, tax details & system diagnostics"
            onPress={() => router.push('/(app)/settings' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<Laptop size={20} color="#3B82F6" />}
            title={t('drawer.linkedDevices')}
            subtitle="Link computers or manage active web sessions"
            badge="QR"
            onPress={() => router.push('/(app)/linked-devices' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
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
            onPress={() => router.push('/appearance' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon={<Globe size={20} color={colors.primary} />}
            title={t('account.language')}
            subtitle={`${currentLanguageInfo.name} (${currentLanguageInfo.nativeName})`}
            onPress={() => router.push('/language' as any)}
          />
        </Card>

        {/* ── 4. DYNAMIC HELP & SUPPORT DESK INFO ── */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          Customer Assistance
        </Text>
        <Card style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={[styles.supportIconBox, { backgroundColor: `${colors.primary}15` }]}>
              <LifeBuoy size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                {getContent('app_name', 'UWO Connect')} Customer Helpdesk
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {getContent('support_hours', 'Mon - Sat, 9:00 AM - 7:00 PM IST')}
              </Text>
            </View>
          </View>

          <View style={styles.supportButtonsRow}>
            <TouchableOpacity
              style={[styles.supportActionBtn, { borderColor: colors.border }]}
              onPress={() => Linking.openURL(`tel:${getContent('support_phone', '+918358990909')}`)}
            >
              <Phone size={14} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 6 }}>
                {getContent('support_phone', '+91 83589 90909')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.supportActionBtn, { borderColor: colors.border }]}
              onPress={() => Linking.openURL(`mailto:${getContent('support_email', 'support@uwo24.com')}`)}
            >
              <Mail size={14} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 6 }}>
                Email Help
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Content Version Badge */}
          <View style={styles.versionFooter}>
            <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
              Dynamic Content Version: <Text variant="caption" weight="bold" color={colors.textPrimary}>v{contentVersion}</Text>
            </Text>
          </View>
        </Card>

        {/* ── 5. ACCOUNT / LOGOUT ── */}
        <Card style={[styles.sectionCard, { marginTop: 16 }]}>
          <MenuItem
            icon={<LogOut size={20} color={colors.error} />}
            title={t('account.logout')}
            subtitle="Sign out and securely clear local session"
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
    padding: 14,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  subtitle: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  supportCard: {
    padding: 18,
    marginTop: 4,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  supportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  supportActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  versionFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4e4e7',
    paddingTop: 10,
    alignItems: 'center',
  },
});
