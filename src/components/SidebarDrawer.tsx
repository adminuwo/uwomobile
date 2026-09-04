import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../theme';
import { Text } from './Text';
import { useDrawerStore } from '../stores/drawerStore';
import { useSessionStore } from '../stores/sessionStore';
import { useTenantBranding } from '../hooks/useTenantBranding';
import { ClientLogoBadge } from './ClientLogoBadge';
import {
  Home,
  MessageSquare,
  Users,
  Zap,
  UserCheck,
  Package,
  Layers,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  QrCode,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  badge?: string;
}

export const SidebarDrawer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isOpen, closeDrawer } = useDrawerStore();
  const { user, logout } = useSessionStore();
  const { clientName, logoUri, initial, isLoading } = useTenantBranding();

  const handleNavigation = (route: string) => {
    closeDrawer();
    router.push(route as any);
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
    router.replace('/(auth)/login');
  };

  const mainMenuItems: MenuItem[] = [
    { id: 'home', label: 'Home Dashboard', icon: Home, route: '/(app)/home' },
    { id: 'inbox', label: 'Omnichannel Inbox', icon: MessageSquare, route: '/(app)/inbox' },
    { id: 'crm', label: 'CRM & Contacts', icon: Users, route: '/(app)/crm' },
    { id: 'team', label: 'Team Hub & QR Invites', icon: UserCheck, route: '/(app)/team', badge: 'QR' },
  ];

  const automationItems: MenuItem[] = [
    { id: 'workflows', label: 'Workflows & Bots', icon: Zap, route: '/(app)/workflows' },
    { id: 'connectors', label: 'Integrations & Apps', icon: Layers, route: '/(app)/connectors' },
    { id: 'products', label: 'Products & Sales', icon: Package, route: '/(app)/sales/products' },
  ];

  const systemItems: MenuItem[] = [
    { id: 'more', label: 'Settings & Workspace', icon: Settings, route: '/(app)/more' },
  ];

  // Helper for initials
  const userInitials = (user?.name || user?.first_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const userRole = (user?.role || 'AGENT').toUpperCase();
  const userName = user?.name || user?.first_name || 'Uwo User';
  const userEmail = user?.email || 'user@uwoconnect.com';

  const renderNavGroup = (title: string, items: MenuItem[]) => (
    <View style={styles.groupContainer}>
      <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.groupHeader}>
        {title}
      </Text>
      {items.map((item) => {
        const IconComponent = item.icon;
        const isActive = pathname.includes(item.id);

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              {
                backgroundColor: isActive ? `${colors.primary}15` : 'transparent',
                borderColor: isActive ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isActive ? colors.primary : `${colors.textMuted}12`,
                  },
                ]}
              >
                <IconComponent size={18} color={isActive ? '#FFFFFF' : colors.textPrimary} />
              </View>
              <Text
                variant="body"
                weight={isActive ? 'bold' : 'regular'}
                color={isActive ? colors.primary : colors.textPrimary}
                style={{ fontSize: 13 }}
              >
                {item.label}
              </Text>
            </View>

            {item.badge ? (
              <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
                <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 9 }}>
                  {item.badge}
                </Text>
              </View>
            ) : (
              <ChevronRight size={14} color={isActive ? colors.primary : colors.textMuted} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        {/* Backdrop overlay touch to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        />

        {/* Drawer Content */}
        <SafeAreaView
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface || '#FFFFFF',
              borderRightColor: colors.border,
            },
          ]}
        >
          {/* Header Bar with Tenant Branding */}
          <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.brandRow}>
              <ClientLogoBadge
                logoUri={logoUri}
                initial={initial}
                isLoading={isLoading}
                size={34}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="h3"
                  weight="bold"
                  color={colors.textPrimary}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {clientName}
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                  Workspace Navigation
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: `${colors.textMuted}15` }]}
              onPress={closeDrawer}
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}25` }]}>
            <View style={styles.profileRow}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text variant="body" weight="bold" color="#FFFFFF" style={{ fontSize: 13 }}>
                  {userInitials}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                  {userName}
                </Text>
                <Text variant="caption" color={colors.textMuted} numberOfLines={1} style={{ fontSize: 11 }}>
                  {userEmail}
                </Text>

                <View style={styles.roleBadgeRow}>
                  <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                    <ShieldCheck size={10} color="#FFF" />
                    <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 9 }}>
                      {userRole}
                    </Text>
                  </View>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1} style={{ fontSize: 10, flex: 1 }}>
                    {clientName}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Links */}
          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {renderNavGroup('MAIN MENU', mainMenuItems)}
            {renderNavGroup('AUTOMATION & SALES', automationItems)}
            {renderNavGroup('SETTINGS', systemItems)}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: `${colors.primary}12` }]}
              onPress={() => handleNavigation('/(app)/team')}
            >
              <QrCode size={16} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary}>
                Connect Web via QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: '#FEF2F2', marginTop: 8 }]}
              onPress={handleLogout}
            >
              <LogOut size={16} color="#EF4444" />
              <Text variant="caption" weight="bold" color="#EF4444">
                Logout Session
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContainer: {
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  drawerFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
});
