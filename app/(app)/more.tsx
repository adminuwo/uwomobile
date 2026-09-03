import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { 
  Package, 
  FileText, 
  Receipt, 
  Wallet, 
  Users, 
  Link, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight
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
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
      <ChevronRight size={20} color={colors.border} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Menu" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text variant="label" style={styles.sectionLabel}>Sales & Finance</Text>
        <Card style={styles.sectionCard}>
          <MenuItem 
            icon={<Package size={20} color={colors.primary} />} 
            title="Products & Services" 
            onPress={() => router.push('/sales/products' as any)} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<FileText size={20} color={colors.primary} />} 
            title="Quotations" 
            onPress={() => router.push('/sales/quotations' as any)} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<Receipt size={20} color={colors.primary} />} 
            title="GST Invoices" 
            onPress={() => router.push('/sales/invoices' as any)} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<Wallet size={20} color={colors.primary} />} 
            title="Wallet & Payments" 
            subtitle="Manage your usage wallet"
            onPress={() => router.push('/sales/wallet' as any)} 
          />
        </Card>

        <Text variant="label" style={styles.sectionLabel}>Workspace</Text>
        <Card style={styles.sectionCard}>
          <MenuItem 
            icon={<Users size={20} color={colors.secondary} />} 
            title="Team Management" 
            onPress={() => router.push('/workspace/team' as any)} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<Link size={20} color={colors.secondary} />} 
            title="Connectors" 
            subtitle="WhatsApp, Instagram, APIs"
            onPress={() => router.push('/workspace/connectors' as any)} 
          />
        </Card>

        <Text variant="label" style={styles.sectionLabel}>Account</Text>
        <Card style={styles.sectionCard}>
          <MenuItem 
            icon={<Bell size={20} color={colors.textPrimary} />} 
            title="Notifications" 
            onPress={() => {}} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<Settings size={20} color={colors.textPrimary} />} 
            title="Settings" 
            onPress={() => {}} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem 
            icon={<LogOut size={20} color={colors.error} />} 
            title="Logout" 
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
    width: 36,
    height: 36,
    borderRadius: 8,
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
    marginLeft: 64, // Align with text
  }
});
