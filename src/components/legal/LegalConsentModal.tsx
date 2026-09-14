import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Card } from '../Card';
import { Button } from '../Button';
import { ShieldCheck, FileText, Lock, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { legalApi } from '../../api/legal';
import { LEGAL_CONSTANTS } from '../../constants/legal';
import { useRouter } from 'expo-router';

interface LegalConsentModalProps {
  visible: boolean;
  onConsentAccepted: () => void;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({
  visible,
  onConsentAccepted,
}) => {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    try {
      setSubmitting(true);
      await legalApi.submitConsent({
        terms_accepted: true,
        terms_version: LEGAL_CONSTANTS.TERMS_VERSION,
        privacy_accepted: true,
        privacy_version: LEGAL_CONSTANTS.PRIVACY_VERSION,
      });
      onConsentAccepted();
    } catch (err: any) {
      Alert.alert(
        'Consent Error',
        err?.message || 'Failed to submit legal consent. Please check your network connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Card style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header Icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
            <ShieldCheck size={28} color={colors.primary} />
          </View>

          <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.title}>
            Legal & Privacy Updates
          </Text>

          <Text variant="body" color={colors.textSecondary} style={styles.description}>
            We have published updated Terms & Conditions (v{LEGAL_CONSTANTS.TERMS_VERSION}) and Privacy Policy (v{LEGAL_CONSTANTS.PRIVACY_VERSION}) to enhance transparency, comply with Meta platform standards, and safeguard customer data.
          </Text>

          {/* Quick Review Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(app)/legal/terms' as any)}
              activeOpacity={0.7}
            >
              <FileText size={18} color={colors.primary} />
              <View style={styles.linkTextContent}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Terms & Conditions
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Version {LEGAL_CONSTANTS.TERMS_VERSION} • Effective {LEGAL_CONSTANTS.EFFECTIVE_DATE}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(app)/legal/privacy' as any)}
              activeOpacity={0.7}
            >
              <Lock size={18} color="#059669" />
              <View style={styles.linkTextContent}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Privacy Policy
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Version {LEGAL_CONSTANTS.PRIVACY_VERSION} • Data & Third-Party Directory
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Consent Checkmark notice */}
          <View style={styles.noticeRow}>
            <CheckCircle2 size={15} color="#059669" />
            <Text variant="caption" color={colors.textSecondary} style={styles.noticeText}>
              By tapping "I Agree & Continue", you confirm you have read and agree to both documents.
            </Text>
          </View>

          {/* Accept Button */}
          <Button
            title={submitting ? 'Recording Consent...' : 'I Agree & Continue'}
            onPress={handleAccept}
            loading={submitting}
            style={styles.acceptBtn}
          />
        </Card>
      </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
    elevation: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  linksContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
  acceptBtn: {
    width: '100%',
  },
});
