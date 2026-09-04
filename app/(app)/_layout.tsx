import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Home, MessageSquare, Users, MoreHorizontal } from 'lucide-react-native';
import { SidebarDrawer } from '../../src/components/SidebarDrawer';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <SidebarDrawer />
      <Tabs
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
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => <MessageSquare size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="crm"
          options={{
            title: 'CRM',
            tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color, size }) => <MoreHorizontal size={size || 22} color={color} />,
          }}
        />

        {/* Hidden Routes (href: null) */}
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
      </Tabs>
    </View>
  );
}
