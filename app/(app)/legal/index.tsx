import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { useTheme } from '../../../src/theme';
import {
  FileText,
  Lock,
  ShieldAlert,
  Trash2,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building,
  Mail,
  Phone,
} from 'lucide-react-native';
import { LEGAL_CONSTANTS } from '../../../src/constants/legal';

interface LegalCardItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
}

function LegalCardItem({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  destructive = false,
}: LegalCardItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.cardItem,
        {
          backgroundColor: colors.surface,
          borderColor: destructive ? colors.error + '40' : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.cardItemContent}>
        <Text
          variant="body"
          weight="bold"
          color={destructive ? colors.error : colors.textPrimary}
        >
          {title}
        </Text>
        <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={destructive ? colors.error : colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function LegalCenterScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Legal & Compliance" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Compliance Header Banner */}
        <Card style={[styles.bannerCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
          <View style={styles.bannerRow}>
            <ShieldCheck size={26} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                UWO Connect Legal Center
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Review terms of service, privacy practices, connected permissions, and data rights.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section 1: Legal Documents */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          Legal Documents
        </Text>
        <View style={styles.groupContainer}>
          <LegalCardItem
            icon={<FileText size={20} color={colors.primary} />}
            iconBg={colors.primary + '18'}
            title="Terms & Conditions"
            subtitle={`Version ${LEGAL_CONSTANTS.TERMS_VERSION} • 23 Sections • Effective ${LEGAL_CONSTANTS.EFFECTIVE_DATE}`}
            onPress={() => router.push('/(app)/legal/terms' as any)}
          />

          <LegalCardItem
            icon={<Lock size={20} color="#059669" />}
            iconBg="#05966918"
            title="Privacy Policy"
            subtitle={`Version ${LEGAL_CONSTANTS.PRIVACY_VERSION} • Data handling & verified third parties`}
            onPress={() => router.push('/(app)/legal/privacy' as any)}
          />
        </View>

        {/* Section 2: Privacy Controls & Permissions */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          Permissions & Account Governance
        </Text>
        <View style={styles.groupContainer}>
          <LegalCardItem
            icon={<ShieldAlert size={20} color="#6366F1" />}
            iconBg="#6366F118"
            title="Data & Permissions"
            subtitle="Meta, Google, Push notifications & hardware permissions"
            onPress={() => router.push('/(app)/legal/permissions' as any)}
          />

          <LegalCardItem
            icon={<Trash2 size={20} color={colors.error} />}
            iconBg={colors.error + '18'}
            title="Account & Data Deletion"
            subtitle="Request permanent deletion of personal account and credentials"
            destructive
            onPress={() => router.push('/(app)/legal/delete-account' as any)}
          />
        </View>

        {/* Section 3: Entity Information & Version Info */}
        <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
          Company & Version Details
        </Text>
        <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Building size={16} color={colors.textMuted} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="caption" weight="bold" color={colors.textMuted}>
                OPERATING ENTITY
              </Text>
              <Text variant="body" weight="medium" color={colors.textPrimary}>
                {LEGAL_CONSTANTS.COMPANY_NAME}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {LEGAL_CONSTANTS.REGISTERED_ADDRESS}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderMuted }]} />

          <View style={styles.infoRow}>
            <Mail size={16} color={colors.textMuted} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="caption" weight="bold" color={colors.textMuted}>
                LEGAL & PRIVACY GRIEVANCE CONTACT
              </Text>
              <Text variant="body" weight="medium" color={colors.primary}>
                {LEGAL_CONSTANTS.CONTACT_EMAIL}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderMuted }]} />

          <View style={styles.metaBadgeRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.card }]}>
              <Text variant="caption" color={colors.textMuted}>
                Terms: v{LEGAL_CONSTANTS.TERMS_VERSION}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.card }]}>
              <Text variant="caption" color={colors.textMuted}>
                Privacy: v{LEGAL_CONSTANTS.PRIVACY_VERSION}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.card }]}>
              <Text variant="caption" color={colors.textMuted}>
                {LEGAL_CONSTANTS.GOVERNING_LAW}
              </Text>
            </View>
          </View>
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
  bannerCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContainer: {
    gap: 10,
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardItemContent: {
    flex: 1,
  },
  infoCard: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
