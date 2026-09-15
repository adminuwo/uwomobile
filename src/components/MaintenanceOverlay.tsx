import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { useContentStore } from '../stores/contentStore';
import { useTheme } from '../theme';
import { AlertTriangle, RefreshCw, Mail, Phone } from 'lucide-react-native';

export const MaintenanceOverlay: React.FC = () => {
  const { colors } = useTheme();
  const maintenance = useContentStore((state) => state.maintenance);
  const checkVersionAndSync = useContentStore((state) => state.checkVersionAndSync);
  const getContent = useContentStore((state) => state.getContent);
  const [checking, setChecking] = useState(false);

  if (!maintenance || !maintenance.is_active) {
    return null;
  }

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await checkVersionAndSync();
    } finally {
      setChecking(false);
    }
  };

  const supportEmail = getContent('support_email', 'support@uwo24.com');
  const supportPhone = getContent('support_phone', '+91 83589 90909');

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Warning Icon Box */}
        <View style={styles.iconBox}>
          <AlertTriangle size={36} color="#ef4444" />
        </View>

        {/* Title & Message */}
        <Text variant="h2" weight="bold" style={styles.title}>
          {maintenance.title || 'Under Maintenance'}
        </Text>

        <Text variant="body" style={styles.message}>
          {maintenance.message || 'We are currently upgrading UWO Connect. Please check back shortly.'}
        </Text>

        {/* Estimated Completion Tag */}
        {maintenance.estimated_completion ? (
          <View style={styles.timeTag}>
            <Text variant="caption" weight="semibold" style={{ color: '#b91c1c' }}>
              Expected Completion: {maintenance.estimated_completion}
            </Text>
          </View>
        ) : null}

        {/* Check Again Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCheckAgain}
          disabled={checking}
          style={styles.refreshBtn}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <RefreshCw size={16} color="#ffffff" />
              <Text variant="label" weight="bold" style={{ color: '#ffffff', marginLeft: 8 }}>
                Check Status
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Support Contact Footer */}
        <View style={styles.supportFooter}>
          <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 8 }}>
            Need urgent assistance?
          </Text>
          <View style={styles.contactRow}>
            <TouchableOpacity 
              style={styles.contactChip} 
              onPress={() => Linking.openURL(`mailto:${supportEmail}`).catch(() => {})}
            >
              <Mail size={13} color={colors.primary} />
              <Text variant="caption" weight="semibold" style={{ color: colors.primary, marginLeft: 4 }}>
                {supportEmail}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactChip} 
              onPress={() => Linking.openURL(`tel:${supportPhone}`).catch(() => {})}
            >
              <Phone size={13} color={colors.primary} />
              <Text variant="caption" weight="semibold" style={{ color: colors.primary, marginLeft: 4 }}>
                {supportPhone}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    color: '#71717a',
    lineHeight: 20,
    marginBottom: 16,
  },
  timeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    marginBottom: 20,
  },
  refreshBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  supportFooter: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4e4e7',
    paddingTop: 16,
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
});
