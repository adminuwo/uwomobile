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
  MessagesSquare,
  Plus,
  Send,
  Star,
  ShieldCheck,
  User,
  ChevronRight,
  MessageSquare,
} from 'lucide-react-native';

export interface FeedbackReply {
  id: string;
  sender_name?: string;
  sender_role: 'ADMIN' | 'USER';
  message: string;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  category: 'GENERAL' | 'BUG' | 'FEATURE' | 'UX' | 'PERFORMANCE' | 'BILLING';
  rating: number;
  message: string;
  source: 'WEB' | 'APP';
  status: 'NEW' | 'IN_REVIEW' | 'REPLIED' | 'RESOLVED';
  created_at: string;
  replies?: FeedbackReply[];
  is_unanswered?: boolean;
}

const CATEGORIES = [
  { key: 'FEATURE', label: 'Feature Request' },
  { key: 'GENERAL', label: 'General' },
  { key: 'BUG', label: 'Bug Report' },
  { key: 'UX', label: 'UI / UX Design' },
  { key: 'PERFORMANCE', label: 'Performance' },
  { key: 'BILLING', label: 'Billing' },
] as const;

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Feedback Modal State
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [category, setCategory] = useState<FeedbackItem['category']>('FEATURE');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail / Thread Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchFeedbacks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/feedback/my-feedback/');
      const list = Array.isArray(res) ? res : res?.results || [];
      setFeedbacks(list);

      if (selectedFeedback) {
        const updated = list.find((item: FeedbackItem) => item.id === selectedFeedback.id);
        if (updated) setSelectedFeedback(updated);
      }
    } catch (err) {
      console.warn('Failed to load feedback:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFeedback]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleCreateFeedback = async () => {
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post('/api/feedback/submit/', {
        category,
        rating,
        message: message.trim(),
        source: 'app',
      });

      setNewModalVisible(false);
      setMessage('');
      setRating(5);
      fetchFeedbacks(true);
      Alert.alert('Feedback Received', 'Thank you! Our engineering team reads all feedback and responds directly.');
    } catch (err: any) {
      console.warn('Feedback submit error:', err);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedFeedback || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await apiClient.post<any>(`/api/feedback/${selectedFeedback.id}/reply/`, {
        message: replyText.trim(),
      });

      setReplyText('');
      const updated = res?.data || res;
      setSelectedFeedback(updated);
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === selectedFeedback.id ? updated : item))
      );
    } catch (err: any) {
      console.warn('Failed to reply:', err);
      Alert.alert('Error', 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const renderStars = (count: number) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={12}
            color={s <= count ? '#F59E0B' : colors.border}
            fill={s <= count ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Feedback & Suggestions"
        showBack={true}
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setNewModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              Give Feedback
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFeedbacks(true)}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <MessagesSquare size={42} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Feedback Yet
              </Text>
              <Text
                variant="caption"
                color={colors.textMuted}
                align="center"
                style={{ marginTop: 4, maxWidth: 280 }}
              >
                Help us improve UWO Connect! Share your experience, report an issue, or request a feature.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedFeedback(item)}
          >
            <Card style={styles.feedbackCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Badge label={item.category} variant="info" />
                  {renderStars(item.rating)}
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

      {/* ── Modal: Give Feedback ── */}
      <Modal visible={newModalVisible} title="Share App Feedback" onClose={() => setNewModalVisible(false)}>
        <View style={styles.modalBody}>
          <Text variant="caption" weight="bold" color={colors.textPrimary}>
            Feedback Category
          </Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryPill,
                  { borderColor: colors.border },
                  category === cat.key && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                ]}
                onPress={() => setCategory(cat.key as any)}
              >
                <Text
                  variant="caption"
                  weight="bold"
                  color={category === cat.key ? colors.primary : colors.textSecondary}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 4 }}>
            Experience Rating
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ padding: 4 }}>
                <Star
                  size={26}
                  color={s <= rating ? '#F59E0B' : colors.border}
                  fill={s <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
            <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginLeft: 8 }}>
              {rating} / 5 Stars
            </Text>
          </View>

          <Input
            label="Your Suggestions or Feedback"
            placeholder="Tell us what you liked or how we can improve..."
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <Button
            title="Submit Feedback"
            loading={submitting}
            onPress={handleCreateFeedback}
          />
        </View>
      </Modal>

      {/* ── Modal: Thread Conversation & Replies ── */}
      <Modal
        visible={selectedFeedback !== null}
        title={selectedFeedback ? `${selectedFeedback.category} Feedback` : 'Feedback Thread'}
        onClose={() => setSelectedFeedback(null)}
      >
        {selectedFeedback && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ maxHeight: 480 }}
          >
            <ScrollView
              contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.metaBanner, { backgroundColor: colors.surface }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge label={selectedFeedback.category} variant="info" />
                    {renderStars(selectedFeedback.rating)}
                  </View>
                  <Text variant="caption" color={colors.textMuted}>
                    Ref #{selectedFeedback.id}
                  </Text>
                </View>
              </View>

              {/* Original Feedback Message */}
              <Card style={{ backgroundColor: colors.surface, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <User size={14} color={colors.textMuted} />
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    Your Submission
                  </Text>
                </View>
                <Text variant="body" color={colors.textPrimary} style={{ lineHeight: 20 }}>
                  {selectedFeedback.message}
                </Text>
              </Card>

              {/* Replies */}
              {selectedFeedback.replies && selectedFeedback.replies.length > 0 && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  {selectedFeedback.replies.map((reply) => {
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
                              {isAdmin ? 'UWO Product Team' : 'You'}
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
                  placeholder="Reply to this thread..."
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
  feedbackCard: {
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
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
