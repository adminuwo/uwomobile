import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Modal } from '../../src/components/Modal';
import { Input } from '../../src/components/Input';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import {
  Mail,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  ChevronRight,
} from 'lucide-react-native';

export interface ContactReply {
  id: string;
  sender_name?: string;
  sender_role: 'ADMIN' | 'USER';
  message: string;
  created_at: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: 'WEB' | 'APP';
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  created_at: string;
  updated_at?: string;
  replies?: ContactReply[];
  is_unanswered?: boolean;
}

export default function ContactUsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Inquiry Modal State
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail / Thread Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchInquiries = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/contact/my-messages/');
      const list = Array.isArray(res) ? res : res?.results || [];
      setInquiries(list);

      // If an inquiry is currently open in modal, update its thread
      if (selectedInquiry) {
        const updated = list.find((item: ContactInquiry) => item.id === selectedInquiry.id);
        if (updated) setSelectedInquiry(updated);
      }
    } catch (err) {
      console.warn('Failed to load contact inquiries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedInquiry]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleCreateInquiry = async () => {
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post('/api/contact/submit/', {
        subject: subject.trim() || 'Mobile App Inquiry',
        phone: phone.trim(),
        message: message.trim(),
        source: 'app',
      });

      setNewModalVisible(false);
      setSubject('');
      setPhone('');
      setMessage('');
      fetchInquiries(true);
      Alert.alert('Inquiry Sent', 'Your inquiry has been submitted. Our team will reply shortly.');
    } catch (err: any) {
      console.warn('Inquiry submit error:', err);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await apiClient.post<any>(`/api/contact/${selectedInquiry.id}/reply/`, {
        message: replyText.trim(),
      });

      setReplyText('');
      const updatedInquiry = res?.data || res;
      setSelectedInquiry(updatedInquiry);
      setInquiries((prev) =>
        prev.map((item) => (item.id === selectedInquiry.id ? updatedInquiry : item))
      );
    } catch (err: any) {
      console.warn('Failed to reply:', err);
      Alert.alert('Error', 'Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Contact Us & Support"
        showBack={true}
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setNewModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Inquiry
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchInquiries(true)}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Mail size={42} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Contact Inquiries
              </Text>
              <Text
                variant="caption"
                color={colors.textMuted}
                align="center"
                style={{ marginTop: 4, maxWidth: 280 }}
              >
                Need help with channel integration, accounts, or custom enterprise solutions? Tap New Inquiry above.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedInquiry(item)}
          >
            <Card style={styles.inquiryCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                    {item.subject || 'Contact Inquiry'}
                  </Text>
                </View>
                <Badge
                  label={item.status}
                  variant={
                    item.status === 'RESOLVED'
                      ? 'neutral'
                      : item.status === 'REPLIED'
                      ? 'success'
                      : 'warning'
                  }
                />
              </View>

              <Text variant="caption" color={colors.textSecondary} numberOfLines={2} style={styles.messagePreview}>
                {item.message}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Badge
                    label={item.source === 'APP' ? 'Mobile App' : 'Website'}
                    variant="neutral"
                  />
                  {item.replies && item.replies.length > 0 && (
                    <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 6 }}>
                      {item.replies.length} {item.replies.length === 1 ? 'reply' : 'replies'}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="caption" color={colors.textMuted}>
                    {item.created_at?.split('T')[0]}
                  </Text>
                  <ChevronRight size={14} color={colors.textMuted} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* ── Modal: Create New Contact Inquiry ── */}
      <Modal visible={newModalVisible} title="Contact Support Desk" onClose={() => setNewModalVisible(false)}>
        <View style={styles.modalBody}>
          <Input
            label="Inquiry Subject"
            placeholder="e.g. WhatsApp Template Approval or Billing question"
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label="Callback Phone (Optional)"
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Message Details"
            placeholder="Describe your question or issue in detail..."
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <Button
            title="Submit Contact Inquiry"
            loading={submitting}
            onPress={handleCreateInquiry}
          />
        </View>
      </Modal>

      {/* ── Modal: Thread Conversation & Replies ── */}
      <Modal
        visible={selectedInquiry !== null}
        title={selectedInquiry?.subject || 'Inquiry Thread'}
        onClose={() => setSelectedInquiry(null)}
      >
        {selectedInquiry && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ maxHeight: 480 }}
          >
            <ScrollView
              contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Inquiry Metadata */}
              <View style={[styles.metaBanner, { backgroundColor: colors.surface }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge
                    label={selectedInquiry.status}
                    variant={
                      selectedInquiry.status === 'RESOLVED'
                        ? 'neutral'
                        : selectedInquiry.status === 'REPLIED'
                        ? 'success'
                        : 'warning'
                    }
                  />
                  <Text variant="caption" color={colors.textMuted}>
                    Ref #{selectedInquiry.id} • {selectedInquiry.created_at?.split('T')[0]}
                  </Text>
                </View>
              </View>

              {/* Original Message Card */}
              <Card style={{ backgroundColor: colors.surface, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <User size={14} color={colors.textMuted} />
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    Your Original Message
                  </Text>
                </View>
                <Text variant="body" color={colors.textPrimary} style={{ lineHeight: 20 }}>
                  {selectedInquiry.message}
                </Text>
              </Card>

              {/* Thread Replies */}
              {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  {selectedInquiry.replies.map((reply) => {
                    const isAdmin = reply.sender_role === 'ADMIN';

                    return (
                      <View
                        key={reply.id}
                        style={[
                          styles.replyBubble,
                          isAdmin
                            ? [styles.adminBubble, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]
                            : [styles.userBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                        ]}
                      >
                        <View style={styles.replyHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            {isAdmin && <ShieldCheck size={14} color={colors.primary} />}
                            <Text
                              variant="caption"
                              weight="bold"
                              color={isAdmin ? colors.primary : colors.textPrimary}
                            >
                              {isAdmin ? 'UWO Connect Support' : 'You'}
                            </Text>
                          </View>
                          <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                            {reply.created_at ? reply.created_at.split('T')[0] : ''}
                          </Text>
                        </View>
                        <Text variant="body" color={colors.textPrimary} style={{ lineHeight: 19 }}>
                          {reply.message}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Reply Input Bar */}
            <View style={[styles.replyInputRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Type a follow-up reply..."
                  value={replyText}
                  onChangeText={setReplyText}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: replyText.trim() ? colors.primary : colors.border },
                ]}
                disabled={!replyText.trim() || sendingReply}
                onPress={handleSendReply}
              >
                <Send size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  inquiryCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messagePreview: {
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBody: {
    gap: 12,
  },
  metaBanner: {
    padding: 10,
    borderRadius: 8,
  },
  replyBubble: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  adminBubble: {
    borderLeftWidth: 3,
  },
  userBubble: {
    alignSelf: 'stretch',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
