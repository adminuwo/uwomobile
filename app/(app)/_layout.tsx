import { View, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Home, MessageSquare, Users, MoreHorizontal } from 'lucide-react-native';
import { SidebarDrawer } from '../../src/components/SidebarDrawer';
import { useSessionStore } from '../../src/stores/sessionStore';

import { useTranslation } from '../../src/i18n';

export default function AppLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const status = useSessionStore((state) => state.status);

  if (status === 'initializing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <SidebarDrawer />
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        {/* Exactly 4 Bottom Tabs */}
        <Tabs.Screen
          name="home"
          options={{
            title: t('navigation.home'),
            tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: t('navigation.inbox'),
            tabBarIcon: ({ color, size }) => <MessageSquare size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="crm"
          options={{
            title: t('navigation.crm'),
            tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: t('navigation.more'),
            tabBarIcon: ({ color, size }) => <MoreHorizontal size={size || 22} color={color} />,
          }}
        />

        {/* Hidden Routes (href: null) */}
        <Tabs.Screen name="appearance" options={{ href: null }} />
        <Tabs.Screen name="language" options={{ href: null }} />
        <Tabs.Screen name="team" options={{ href: null }} />
        <Tabs.Screen name="workspace/team" options={{ href: null }} />
        <Tabs.Screen name="connectors" options={{ href: null }} />
        <Tabs.Screen name="sales/invoices" options={{ href: null }} />
        <Tabs.Screen name="sales/products" options={{ href: null }} />
        <Tabs.Screen name="sales/quotations" options={{ href: null }} />
        <Tabs.Screen name="sales/wallet" options={{ href: null }} />
        <Tabs.Screen name="conversation/[id]" options={{ href: null }} />
        <Tabs.Screen name="lead/[id]" options={{ href: null }} />
        <Tabs.Screen name="workflows" options={{ href: null }} />
        <Tabs.Screen name="broadcasts" options={{ href: null }} />
        <Tabs.Screen name="knowledge" options={{ href: null }} />
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="support" options={{ href: null }} />
        <Tabs.Screen name="email" options={{ href: null }} />
        <Tabs.Screen name="gmail" options={{ href: null }} />
        <Tabs.Screen name="youtube" options={{ href: null }} />
        <Tabs.Screen name="google-news" options={{ href: null }} />
        <Tabs.Screen name="automations" options={{ href: null }} />
        <Tabs.Screen name="team-chat" options={{ href: null }} />
        <Tabs.Screen name="guides" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="sales/proposals" options={{ href: null }} />
        <Tabs.Screen name="sales/orders" options={{ href: null }} />
        <Tabs.Screen name="plans" options={{ href: null }} />
        <Tabs.Screen name="agency" options={{ href: null }} />
        <Tabs.Screen name="calls" options={{ href: null }} />
        <Tabs.Screen name="linked-devices" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
