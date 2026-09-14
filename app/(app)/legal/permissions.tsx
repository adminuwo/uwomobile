import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { useTheme } from '../../../src/theme';
import {
  ShieldAlert,
  MessageSquare,
  Globe,
  Bell,
  Camera,
  HardDrive,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';

interface PermissionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  category: string;
  description: string;
  usageDetails: string;
  howToManage: string;
}

function PermissionCard({
  icon,
  iconBg,
  title,
  category,
  description,
  usageDetails,
  howToManage,
}: PermissionCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {title}
          </Text>
          <Text variant="caption" color={colors.primary} weight="bold">
            {category}
          </Text>
        </View>
      </View>

      <Text variant="caption" color={colors.textSecondary} style={styles.desc}>
        {description}
      </Text>

      <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.borderMuted }]}>
        <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.metaLabel}>
          WHAT DATA IS ACCESSED:
        </Text>
        <Text variant="caption" color={colors.textPrimary} style={{ marginTop: 2 }}>
          {usageDetails}
        </Text>
      </View>

      <View style={styles.manageRow}>
        <CheckCircle2 size={13} color="#059669" />
        <Text variant="caption" color={colors.textMuted} style={{ flex: 1, marginLeft: 6 }}>
          Control: {howToManage}
        </Text>
      </View>
    </Card>
  );
}

export default function PermissionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Data & Permissions" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={[styles.introCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
          <View style={styles.introRow}>
            <ShieldAlert size={24} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                Transparent Access Directory
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                UWO Connect accesses only the specific data and device capabilities required to operate your unified messaging and CRM.
              </Text>
            </View>
          </View>
        </Card>

        {/* 1. Meta */}
        <PermissionCard
          icon={<MessageSquare size={20} color="#25D366" />}
          iconBg="#25D36618"
          title="Meta Platforms & WhatsApp Cloud API"
          category="Omnichannel Communications"
          description="Enables two-way customer messaging across official WhatsApp Business Accounts, Facebook Pages, and Instagram DMs."
          usageDetails="Customer phone numbers, message text, media links, and delivery callbacks (Sent, Delivered, Read)."
          howToManage="Can be connected or disconnected anytime in Settings → Connectors."
        />

        {/* 2. Google */}
        <PermissionCard
          icon={<Globe size={20} color="#4285F4" />}
          iconBg="#4285F418"
          title="Google Identity & SSO"
          category="Authentication"
          description="Allows seamless, one-tap login and profile linking using your verified Google Business account."
          usageDetails="Verified email address, full name, and avatar image URL returned by Google ID token."
          howToManage="Can be unlinked or managed via Google Account Security permissions."
        />

        {/* 3. Notifications */}
        <PermissionCard
          icon={<Bell size={20} color="#F59E0B" />}
          iconBg="#F59E0B18"
          title="Push & In-App Notifications"
          category="Operational Alerts"
          description="Delivers timely alerts for incoming customer chats, team assignments, and delivery receipts."
          usageDetails="Device push token and notification badge counts."
          howToManage="Configured in Android App Settings → Notifications."
        />

        {/* 4. Camera & Media */}
        <PermissionCard
          icon={<Camera size={20} color="#8B5CF6" />}
          iconBg="#8B5CF618"
          title="Camera & Media Library"
          category="Device Capabilities"
          description="Allows you to capture photos, attach files, or upload organization logos in chat and sales documents."
          usageDetails="Only files or photos that you explicitly choose to select and upload."
          howToManage="Prompted on demand; revocable in Android App Permissions."
        />

        {/* 5. Storage */}
        <PermissionCard
          icon={<HardDrive size={20} color="#64748B" />}
          iconBg="#64748B18"
          title="Local Device Storage"
          category="App State & Caching"
          description="Stores encrypted authentication tokens, visual theme preferences, and offline draft states."
          usageDetails="Local app cache and secure AsyncStorage keys."
          howToManage="Cleared automatically upon logging out or uninstalling the app."
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  introCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
