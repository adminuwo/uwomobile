import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { useTheme } from '../../theme';
import { crmApi, Contact } from '../../api/crm';
import { X, Phone, Mail, UserCheck, Tag, Calendar, FolderKanban } from 'lucide-react-native';

interface CustomerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  channel?: string;
  status?: string;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  visible,
  onClose,
  contactName,
  contactPhone,
  contactEmail,
  channel = 'WHATSAPP',
  status = 'OPEN',
}) => {
  const { colors, spacing } = useTheme();
  const [currentStage, setCurrentStage] = useState(status);
  const [updating, setUpdating] = useState(false);

  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

  const handleStageChange = async (newStage: string) => {
    setCurrentStage(newStage);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text variant="h3" weight="bold" color={colors.textPrimary}>
              Customer Profile & CRM Info
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Avatar & Main Info */}
            <View style={styles.avatarRow}>
              <Avatar name={contactName} size="lg" />
              <View style={styles.mainInfo}>
                <Text variant="h2" weight="bold" color={colors.textPrimary}>
                  {contactName}
                </Text>
                <View style={styles.channelRow}>
                  <Badge label={channel} variant="info" />
                  <Badge label={currentStage} variant="success" />
                </View>
              </View>
            </View>

            {/* Contact Details Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text variant="label" color={colors.textMuted} style={styles.cardSectionTitle}>
                CONTACT DETAILS
              </Text>

              <View style={styles.infoRow}>
                <Phone size={16} color={colors.primary} />
                <Text variant="body" color={colors.textPrimary}>
                  {contactPhone || 'No phone number'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Mail size={16} color={colors.secondary} />
                <Text variant="body" color={colors.textPrimary}>
                  {contactEmail || 'No email associated'}
                </Text>
              </View>
            </View>

            {/* CRM Stage Selector */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text variant="label" color={colors.textMuted} style={styles.cardSectionTitle}>
                UPDATE CRM PIPELINE STAGE
              </Text>
              <View style={styles.stageGrid}>
                {stages.map((stg) => {
                  const isActive = currentStage === stg;
                  return (
                    <TouchableOpacity
                      key={stg}
                      style={[
                        styles.stagePill,
                        {
                          backgroundColor: isActive ? colors.primary : colors.surface,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleStageChange(stg)}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        color={isActive ? '#FFF' : colors.textPrimary}
                      >
                        {stg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* System Info */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text variant="label" color={colors.textMuted} style={styles.cardSectionTitle}>
                SYSTEM RECORD
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Omnichannel Lead ID: {contactPhone || contactName}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  mainInfo: {
    flex: 1,
    gap: 6,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 10,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
});
