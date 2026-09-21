import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Alert,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { useTheme } from '../../theme';
import { SalesDocument, salesDocumentsApi } from '../../api/salesDocuments';
import { useTenantBranding } from '../../hooks/useTenantBranding';
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Share2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  User,
  Phone,
} from 'lucide-react-native';

interface SendProposalModalProps {
  visible: boolean;
  proposal: SalesDocument | null;
  onClose: () => void;
  onSentSuccess?: () => void;
}

export const SendProposalModal: React.FC<SendProposalModalProps> = ({
  visible,
  proposal,
  onClose,
  onSentSuccess,
}) => {
  const { colors } = useTheme();
  const { clientName } = useTenantBranding();

  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (proposal) {
      setRecipientPhone((proposal as any).customer_phone || (proposal as any).phone || '');
      setRecipientEmail((proposal as any).customer_email || (proposal as any).email || '');
      setCopied(false);
    }
  }, [proposal]);

  if (!visible || !proposal) return null;

  const docType = (proposal.document_type || 'PROPOSAL').toLowerCase();
  const docNumber = proposal.document_number || '1001';
  const totalAmount = Number(proposal.total_amount ?? proposal.grand_total ?? 0);
  const formattedAmount = `₹${totalAmount.toLocaleString('en-IN')}`;
  const customer = proposal.customer_name || proposal.customer || 'Client';

  const publicUrl = `https://uwoconnect.aisa24.com/public/${docType}/${proposal.id}`;

  const defaultMessage = `Hello ${customer},\n\nPlease review your ${docType.toUpperCase()} #${docNumber} from ${clientName || 'Unified Web Options'} for ${formattedAmount}.\n\nView, download, & approve here:\n${publicUrl}\n\nRegards,\n${clientName || 'Unified Web Options'}`;

  // 1. WhatsApp Dispatch
  const handleSendWhatsApp = async () => {
    setIsSendingWa(true);
    try {
      // Fire backend notification in background to update status to SENT
      salesDocumentsApi
        .sendDocument(proposal.id, {
          channel: 'WHATSAPP',
          phone: recipientPhone.trim(),
          customMessage: defaultMessage,
        } as any)
        .catch(() => {});

      const cleanPhone = recipientPhone.replace(/[^0-9+]/g, '');
      const encodedMsg = encodeURIComponent(defaultMessage);
      const waNativeUrl = cleanPhone
        ? `whatsapp://send?phone=${cleanPhone}&text=${encodedMsg}`
        : `whatsapp://send?text=${encodedMsg}`;
      const waWebUrl = cleanPhone
        ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMsg}`
        : `https://wa.me/?text=${encodedMsg}`;

      const canOpen = await Linking.canOpenURL(waNativeUrl).catch(() => false);
      if (canOpen) {
        await Linking.openURL(waNativeUrl);
      } else {
        await Linking.openURL(waWebUrl);
      }

      if (onSentSuccess) onSentSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not open WhatsApp');
    } finally {
      setIsSendingWa(false);
    }
  };

  // 2. Email Dispatch
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const email = recipientEmail.trim();
      const subject = encodeURIComponent(`${clientName || 'Unified Web Options'} - ${docType.toUpperCase()} #${docNumber}`);
      const body = encodeURIComponent(defaultMessage);

      // Attempt backend email dispatch
      if (email) {
        try {
          await salesDocumentsApi.sendDocument(proposal.id, {
            channel: 'EMAIL',
            recipient: email,
            customMessage: defaultMessage,
          } as any);
        } catch {
          // If backend email worker fails or offline, launch native mail app
        }
      }

      // Open native mail app
      const mailtoUrl = email ? `mailto:${email}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`;
      await Linking.openURL(mailtoUrl);

      if (onSentSuccess) onSentSuccess();
    } catch (err: any) {
      Alert.alert('Notice', 'Opening mail client...');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 3. Multi-Platform System Share (Instagram, Telegram, SMS, Slack, AirDrop)
  const handleShareAll = async () => {
    try {
      await Share.share({
        title: `${docType.toUpperCase()} #${docNumber}`,
        message: defaultMessage,
        url: publicUrl,
      });
      if (onSentSuccess) onSentSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to share');
    }
  };

  // 4. Copy Proposal Link
  const handleCopyLink = () => {
    Clipboard.setString(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 5. Open Web Preview
  const handleOpenPreview = () => {
    Linking.openURL(publicUrl).catch(() => {
      Alert.alert('Error', 'Could not open link in browser');
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Top Bar */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.primary}18` }]}>
                <Send size={18} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  Send {docType.toUpperCase()}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Instant multi-platform dispatch
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Proposal Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryTop}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    #{docNumber}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    Client: {customer}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="h3" weight="bold" color={colors.primary}>
                    {formattedAmount}
                  </Text>
                  <Badge label={proposal.status || 'READY'} variant="success" />
                </View>
              </View>
            </View>

            {/* Recipient Coordinates */}
            <View style={styles.sectionHeader}>
              <Text variant="caption" weight="bold" color={colors.textSecondary}>
                RECIPIENT CONTACT DETAILS
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="WhatsApp / Mobile Number"
                placeholder="e.g. +91 9876543210"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Recipient Email Address"
                placeholder="client@company.com"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Platform Dispatch Actions */}
            <View style={styles.sectionHeader}>
              <Text variant="caption" weight="bold" color={colors.textSecondary}>
                SELECT PLATFORM TO SEND
              </Text>
            </View>

            {/* 1. WhatsApp Action */}
            <TouchableOpacity
              style={[styles.platformCard, { borderColor: '#10B981', backgroundColor: '#10B9810D' }]}
              onPress={handleSendWhatsApp}
              activeOpacity={0.8}
              disabled={isSendingWa}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#10B981' }]}>
                {isSendingWa ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MessageCircle size={20} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.platformDetails}>
                <View style={styles.platformTitleRow}>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    Send via WhatsApp
                  </Text>
                  <View style={styles.instantBadge}>
                    <Text style={styles.instantBadgeText}>POPULAR</Text>
                  </View>
                </View>
                <Text variant="caption" color={colors.textMuted}>
                  Open WhatsApp chat with prefilled proposal link & pitch
                </Text>
              </View>
            </TouchableOpacity>

            {/* 2. Email Action */}
            <TouchableOpacity
              style={[styles.platformCard, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleSendEmail}
              activeOpacity={0.8}
              disabled={isSendingEmail}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#2563EB' }]}>
                {isSendingEmail ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Mail size={20} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.platformDetails}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Send via Email
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Send formatted proposal document to recipient's inbox
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. All Platforms / Other Apps */}
            <TouchableOpacity
              style={[styles.platformCard, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleShareAll}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#8B5CF6' }]}>
                <Share2 size={20} color="#FFFFFF" />
              </View>
              <View style={styles.platformDetails}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Share to All Platforms
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Instagram DM, Telegram, Slack, Messages, AirDrop & more
                </Text>
              </View>
            </TouchableOpacity>

            {/* 4. Copy Link */}
            <TouchableOpacity
              style={[styles.platformCard, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: copied ? '#10B981' : `${colors.textMuted}30` }]}>
                {copied ? <Check size={20} color="#FFFFFF" /> : <Copy size={20} color={colors.textPrimary} />}
              </View>
              <View style={styles.platformDetails}>
                <View style={styles.platformTitleRow}>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    {copied ? 'Link Copied to Clipboard!' : 'Copy Proposal Link'}
                  </Text>
                  {copied && (
                    <View style={[styles.instantBadge, { backgroundColor: '#10B981' }]}>
                      <Text style={[styles.instantBadgeText, { color: '#FFFFFF' }]}>COPIED</Text>
                    </View>
                  )}
                </View>
                <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {publicUrl}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 5. Web Preview */}
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={handleOpenPreview}
              activeOpacity={0.7}
            >
              <ExternalLink size={14} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 6 }}>
                Open Live Web Proposal Preview
              </Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 8,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  platformIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  instantBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  instantBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
});
