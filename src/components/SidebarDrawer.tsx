import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../theme';
import { Text } from './Text';
import { useTranslation } from '../i18n';
import { useDrawerStore } from '../stores/drawerStore';
import { useSessionStore } from '../stores/sessionStore';
import { useTenantBranding } from '../hooks/useTenantBranding';
import { useChannelAccess } from '../hooks/useChannelAccess';
import { ClientLogoBadge } from './ClientLogoBadge';
import {
  Home,
  MessageSquare,
  Users,
  Zap,
  GitBranch,
  UserCheck,
  Package,
  Layers,
  Link2,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  Newspaper,
  FileText,
  FileCheck,
  ShoppingBag,
  Receipt,
  Wallet,
  Brain,
  Bot,
  PhoneCall,
  Settings,
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
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isOpen, closeDrawer } = useDrawerStore();
  const { user } = useSessionStore();
  const { clientName, logoUri, initial, isLoading } = useTenantBranding();
  const { isChannelComingSoon } = useChannelAccess();

  const handleNavigation = (route: string) => {
    closeDrawer();
    if (route.includes('/connectors')) {
      const { useConnectorsTabStore } = require('../stores/connectorsTabStore');
      useConnectorsTabStore.getState().setTargetTab('ALL');
    }
    router.push(route as any);
  };

  const handleLogout = async () => {
    closeDrawer();
    const { logoutAndResetSession } = require('../services/sessionLifecycle');
    await logoutAndResetSession();
  };

  // ──────────────────────────────────────────────
  // PRIMARY – Daily-use modules (clean & focused)
  // ──────────────────────────────────────────────
  const primaryItems: MenuItem[] = [
    { id: 'home', label: t('drawer.homeDashboard'), icon: Home, route: '/(app)/home' },
    { id: 'inbox', label: t('drawer.inbox'), icon: MessageSquare, route: '/(app)/inbox' },
    { id: 'crm', label: t('drawer.crmContacts'), icon: Users, route: '/(app)/crm' },
    { id: 'team', label: t('drawer.teamHub'), icon: UserCheck, route: '/(app)/team', badge: 'QR' },
    { id: 'team-chat', label: t('drawer.teamWorkspaceChat'), icon: MessageSquare, route: '/(app)/team-chat' },
    { id: 'calls', label: t('drawer.voiceVideoCalls'), icon: PhoneCall, route: '/(app)/calls' },
    {
      id: 'google-news',
      label: t('drawer.googleNewsHub'),
      icon: Newspaper,
      route: '/(app)/google-news',
      badge: isChannelComingSoon('google_news') ? 'SOON' : 'LIVE'
    },
  ];

  // ──────────────────────────────────────────────
  // AUTOMATION & FLOWS
  // ──────────────────────────────────────────────
  const automationItems: MenuItem[] = [
    { id: 'broadcasts', label: t('drawer.broadcastCampaigns'), icon: Megaphone, route: '/(app)/broadcasts' },
    { id: 'workflows', label: t('drawer.workflowsBots'), icon: GitBranch, route: '/(app)/workflows' },
    { id: 'automations', label: t('drawer.keywordAutoReplies'), icon: Bot, route: '/(app)/automations' },
    { id: 'knowledge', label: t('drawer.aiKnowledgeBase'), icon: Brain, route: '/(app)/knowledge' },
    { id: 'connectors', label: t('drawer.integrationsApps'), icon: Link2, route: '/(app)/connectors' },
  ];

  // ──────────────────────────────────────────────
  // SALES & COMMERCE
  // ──────────────────────────────────────────────
  const salesItems: MenuItem[] = [
    { id: 'proposals', label: t('drawer.proposals'), icon: FileText, route: '/(app)/sales/proposals', badge: 'NEW' },
    { id: 'quotations', label: t('drawer.quotations'), icon: FileCheck, route: '/(app)/sales/quotations' },
    { id: 'invoices', label: t('drawer.gstInvoices'), icon: Receipt, route: '/(app)/sales/invoices' },
    { id: 'products', label: t('drawer.productsServices'), icon: ShoppingBag, route: '/(app)/sales/products' },
    { id: 'orders', label: t('drawer.ordersSales'), icon: Receipt, route: '/(app)/sales/orders' },
    { id: 'wallet', label: t('drawer.walletBilling'), icon: Wallet, route: '/(app)/sales/wallet' },
  ];

  // ─────────────────────────────────────────────────────────────
  // REMOVED FROM SIDEBAR (hidden, NOT deleted):
  //   - Gmail          → hidden (integration kept, not in sidebar)
  //   - Email/Outlook  → hidden (integration kept, not in sidebar)
  //   - YouTube        → hidden (integration kept, not in sidebar)
  //   - Agency Hub     → hidden (code kept, not in sidebar)
  //   - Learning Center→ hidden (code kept, not in mobile nav)
  //   - Linked Devices → moved into Settings screen
  //
  // MOVED TO "MORE" SCREEN:
  //   - Reports, Support, Plans
  // ─────────────────────────────────────────────────────────────

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
        const isActive = pathname === item.route;
        const isComingSoon = isChannelComingSoon(item.id);
        const displayBadge = isComingSoon ? 'SOON' : item.badge;

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.navItem,
              {
                backgroundColor: isActive ? `${colors.primary}18` : 'transparent',
                borderColor: isActive ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => handleNavigation(item.route)}
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

            {displayBadge ? (
              <View style={[
                styles.badgePill, 
                { backgroundColor: isComingSoon ? '#F59E0B' : displayBadge === 'LIVE' ? '#DC2626' : colors.primary }
              ]}>
                <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 9 }}>
                  {displayBadge}
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


  // CRITICAL: When drawer is closed, do NOT render Modal or its absoluteFill backdrop into the DOM/view hierarchy!
  // Otherwise on Web and mobile, the backdrop intercepts all clicks across the entire screen!
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        />

        <View
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface || '#FFFFFF',
              borderRightColor: colors.border,
              paddingTop: insets.top > 0 ? insets.top + 4 : 10,
            },
          ]}
        >
          <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.brandRow}>
              <View style={[styles.uwoLogoBox, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.uwoLogoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="h3"
                  weight="bold"
                  color={colors.textPrimary}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  UWO Connect
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                  Multi-channel automation platform
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNavigation('/(app)/settings')}
            style={[styles.profileCard, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}25` }]}
          >
            <View style={styles.profileRow}>
              <ClientLogoBadge
                logoUri={logoUri}
                initial={initial || userInitials}
                isLoading={isLoading}
                size={38}
              />

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

              <ChevronRight size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {renderNavGroup(t('drawer.channelsWorkspace'), primaryItems)}
            {renderNavGroup(t('drawer.automationFlows'), automationItems)}
            {renderNavGroup(t('drawer.salesCommerce'), salesItems)}
          </ScrollView>

          {/* ── Footer: Settings + Logout ── */}
          <View
            style={[
              styles.drawerFooter,
              {
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom + 14, 20),
                flexDirection: 'row',
                gap: 8,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.footerBtn, { flex: 1, backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30`, borderWidth: 1 }]}
              onPress={() => handleNavigation('/(app)/settings')}
            >
              <Settings size={15} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary}>
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerBtn, { flex: 1, backgroundColor: '#FEF2F2' }]}
              onPress={handleLogout}
            >
              <LogOut size={15} color="#EF4444" />
              <Text variant="caption" weight="bold" color="#EF4444">
                {t('drawer.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 6,
    paddingBottom: 8,
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
  uwoLogoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  uwoLogoImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
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
    paddingTop: 4,
  },
  groupContainer: {
    marginBottom: 10,
  },
  groupHeader: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
    marginLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 3,
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
