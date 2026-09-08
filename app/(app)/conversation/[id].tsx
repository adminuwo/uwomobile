import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Avatar } from '../../../src/components/Avatar';
import { ChannelBadge, getChannelColor } from '../../../src/components/inbox/ChannelBadge';
import { MessageBubble } from '../../../src/components/inbox/MessageBubble';
import { MessageComposer } from '../../../src/components/inbox/MessageComposer';
import { WhatsAppTemplateModal } from '../../../src/components/inbox/WhatsAppTemplateModal';
import { CustomerProfileModal } from '../../../src/components/inbox/CustomerProfileModal';
import { TransferModal } from '../../../src/components/inbox/TransferModal';
import { AuditLogModal, AuditLogItem } from '../../../src/components/inbox/AuditLogModal';
import { inboxApi, Message } from '../../../src/api/inbox';
import { templatesApi } from '../../../src/api/templates';
import { inboxWebSocket } from '../../../src/services/inboxWebSocket';
import { useTheme } from '../../../src/theme';
import { ArrowLeft, UserCheck, Bot, ArrowRightLeft, History, StickyNote } from 'lucide-react-native';

export default function ConversationDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string; rawAddress?: string; name?: string; channel?: string; isLocked?: string; assignedTo?: string }>();

  const convoId = params.id;
  const targetAddress = params.rawAddress || params.id;
  const contactName = params.name || 'Customer';
  const channel = params.channel || 'WHATSAPP';
  const channelColor = getChannelColor(channel);

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'NOTES'>('MESSAGES');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [resumingBot, setResumingBot] = useState(false);
  const [isBotPaused, setIsBotPaused] = useState<boolean>(params.isLocked === 'true' || Boolean(params.assignedTo));
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Background message synchronizer (quietly fetches updates without flickering loader)
  const syncMessages = useCallback(async (isSilent = true) => {
    if (!targetAddress) return;
    try {
      if (!isSilent) setRefreshing(true);
      const res = await inboxApi.getMessages({ contactId: targetAddress, limit: 50, offset: 0 });
      const fetched = res.messages;
      if (!fetched) return;

      setMessages((prev) => {
        if (prev.length === 0) return fetched;

        const pendingTemps = prev.filter(
          (m) => m.id.startsWith('temp_') && !fetched.some((f) => f.body === m.body)
        );
        const nonTempPrev = prev.filter((m) => !m.id.startsWith('temp_'));

        const hasChanges =
          fetched.length !== nonTempPrev.length ||
          fetched.some((f, idx) => {
            const p = nonTempPrev[idx];
            return !p || p.id !== f.id || p.status !== f.status;
          });

        if (!hasChanges && pendingTemps.length === prev.filter((m) => m.id.startsWith('temp_')).length) {
          return prev;
        }

        return [...fetched, ...pendingTemps];
      });
    } catch (err) {
      console.warn('Failed to sync messages:', err);
    } finally {
      if (!isSilent) setRefreshing(false);
    }
  }, [targetAddress]);

  const fetchChatHistory = useCallback(async () => {
    if (!targetAddress) return;
    try {
      setLoading(true);
      await syncMessages(true);
    } catch (err) {
      console.warn('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [targetAddress, syncMessages]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Periodic quiet auto-polling every 2.5s so new incoming WhatsApp messages show immediately
  useEffect(() => {
    const interval = setInterval(() => {
      syncMessages(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [syncMessages]);

  // Real-time WebSocket integration for live incoming messages & typing indicators
  useEffect(() => {
    const unsubscribe = inboxWebSocket.subscribe((data) => {
      if (data.type === 'new_message' && data.message) {
        const msg: Message = data.message;
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        const cleanTarget = (targetAddress || '').replace(/\D/g, '');
        const cleanFrom = (msg.from_address || '').replace(/\D/g, '');
        const cleanTo = (msg.to_address || '').replace(/\D/g, '');

        const matchesTargetNumber =
          (cleanTarget && cleanFrom && (cleanFrom.endsWith(cleanTarget) || cleanTarget.endsWith(cleanFrom))) ||
          (cleanTarget && cleanTo && (cleanTo.endsWith(cleanTarget) || cleanTarget.endsWith(cleanTo)));

        const isForThisChat =
          matchesTargetNumber ||
          msg.from_address === targetAddress ||
          msg.to_address === targetAddress ||
          msg.from_address === convoId ||
          msg.to_address === convoId;

        if (isForThisChat) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const tempIdx = prev.findIndex((m) => m.id.startsWith('temp_') && m.body === msg.body);
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = msg;
              return updated;
            }
            return [...prev, msg];
          });
        }
      }

      if (data.type === 'message_status_update') {
        const targetId = data.message_id;
        const wamid = data.whatsapp_message_id;
        const newStatus = data.status;

        setMessages((prev) =>
          prev.map((m) => {
            const matches =
              (targetId && m.id === targetId) ||
              (wamid && (m as any).whatsapp_message_id === wamid) ||
              (wamid && m.metadata?.response?.messages?.[0]?.id === wamid);
            return matches ? { ...m, status: newStatus } : m;
          })
        );
      }

      if (data.type === 'typing_status') {
        // Ignore typing events generated by current app or other agents
        if (data.sender_type === 'agent' || data.sender === 'agent') return;
        if (data.conversation_id === convoId || data.contact_id === targetAddress) {
          if (data.is_typing) {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            // Auto-clear typing indicator after 3.5 seconds
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3500);
          } else {
            setIsTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          }
        }
      }
    });

    // Broadcast viewing status and mark messages as read
    inboxWebSocket.send({
      type: 'view_conversation',
      conversation_id: convoId,
    });
    if (convoId) {
      inboxApi.markAsRead(convoId);
    }

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    };
  }, [convoId, targetAddress]);

  const handleSendMessage = async (text: string, isInternalNote: boolean) => {
    if (!text.trim() || sending) return;

    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setSending(true);
    const nowTs = Date.now();
    const isNote = isInternalNote || activeTab === 'NOTES';
    const optimisticMsg: Message = {
      id: `temp_${nowTs}`,
      from_address: 'Me',
      to_address: targetAddress,
      body: text,
      channel: channel,
      message_type: isNote ? 'INTERNAL' : 'OUTGOING',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const serverMsg = await inboxApi.sendMessage({
        to_number: targetAddress,
        body: text,
        channel: channel,
        message_type: isNote ? 'INTERNAL' : 'OUTGOING',
      });

      if (serverMsg) {
        setMessages((prev) => {
          const hasServerId = prev.some((m) => m.id === serverMsg.id);
          if (hasServerId) {
            return prev.filter((m) => m.id !== optimisticMsg.id);
          }
          return prev.map((m) => (m.id === optimisticMsg.id ? serverMsg : m));
        });
      }
    } catch (err: any) {
      console.warn('Send message error:', err);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...m, status: 'FAILED' } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async (templateName: string, variables: Record<string, string>) => {
    try {
      setSending(true);
      await templatesApi.sendTemplateMessage({
        contact_id: convoId,
        phone_number: targetAddress,
        template_name: templateName,
        variables,
      });
      fetchChatHistory();
    } catch (err) {
      console.warn('Failed to send template:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    if (!convoId || takingOver) return;
    try {
      setTakingOver(true);
      const res = await inboxApi.takeoverConversation(convoId);
      setIsBotPaused(true);
      Alert.alert('👤 Human Takeover', res?.message || 'AI Bot paused. Conversation is now assigned to you.');
    } catch (err: any) {
      console.warn('Takeover error:', err);
      Alert.alert('Takeover Error', err?.message || 'Failed to takeover chat.');
    } finally {
      setTakingOver(false);
    }
  };

  const handleResumeBot = async () => {
    if (!convoId || resumingBot) return;
    try {
      setResumingBot(true);
      const res = await inboxApi.resumeBot(convoId);
      setIsBotPaused(false);
      Alert.alert('🤖 Bot Resumed', res?.message || 'AI Bot & automations have been successfully resumed for this chat.');
    } catch (err: any) {
      console.warn('Resume bot error:', err);
      Alert.alert('Resume Bot', err?.message || 'Failed to resume AI bot.');
    } finally {
      setResumingBot(false);
    }
  };

  const handleTransfer = async (payload: { agent_id?: string; department?: string; note?: string }) => {
    if (!convoId) return;
    try {
      const res = await inboxApi.transferConversation(convoId, payload);
      Alert.alert('🔄 Transferred', res?.message || 'Chat transferred successfully.');
    } catch (err: any) {
      console.warn('Transfer error:', err);
      Alert.alert('Transfer Error', err?.message || 'Failed to transfer chat.');
    }
  };

  const handleOpenAuditLogs = async () => {
    if (!convoId) return;
    try {
      setShowAuditModal(true);
      setLoadingAudit(true);
      const res = await inboxApi.getAuditLogs(convoId);
      const logList = Array.isArray(res) ? res : (res?.results || res?.logs || []);
      setAuditLogs(logList);
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleBack = useCallback(() => {
    router.navigate('/(app)/inbox' as any);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack]);

  const handleTyping = (text: string) => {
    if (text.length > 0) {
      inboxWebSocket.send({
        type: 'typing_status',
        conversation_id: convoId,
        contact_id: targetAddress,
        sender_type: 'agent',
        is_typing: true,
      });

      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        inboxWebSocket.send({
          type: 'typing_status',
          conversation_id: convoId,
          contact_id: targetAddress,
          sender_type: 'agent',
          is_typing: false,
        });
      }, 2000);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'NOTES') return m.message_type === 'INTERNAL';
    return true;
  });

  return (
    <Screen safeAreaEdges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileClick}
          onPress={() => setShowProfileModal(true)}
          activeOpacity={0.7}
        >
          <Avatar name={contactName} size="sm" />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {contactName}
            </Text>
            <View style={styles.subInfoRow}>
              <ChannelBadge channel={channel} size="sm" showBg={false} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons Toolbar: Dynamic Bot Active / Bot Deactive Toggle, Transfer, Audit History */}
        <View style={styles.actionToolbar}>
          {isBotPaused ? (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.botToggleBtn, { borderColor: '#F43F5E', backgroundColor: '#F43F5E15' }]}
              onPress={handleResumeBot}
              disabled={resumingBot}
            >
              {resumingBot ? (
                <ActivityIndicator size="small" color="#F43F5E" />
              ) : (
                <>
                  <Bot size={12} color="#F43F5E" />
                  <Text style={[styles.botToggleText, { color: '#E11D48' }]}>Bot Deactive</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.botToggleBtn, { borderColor: '#10B981', backgroundColor: '#10B98115' }]}
              onPress={handleTakeover}
              disabled={takingOver}
            >
              {takingOver ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <Bot size={12} color="#10B981" />
                  <Text style={[styles.botToggleText, { color: '#047857' }]}>Bot Active</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.transferBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowTransferModal(true)}
          >
            <ArrowRightLeft size={12} color={colors.textSecondary} />
            <Text style={[styles.transferText, { color: colors.textSecondary }]}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: `${channelColor}12` }]} onPress={handleOpenAuditLogs}>
            <History size={14} color={channelColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={channelColor} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredMessages}
            keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : `msg_${index}`)}
            renderItem={({ item }) => (
              <MessageBubble message={item} contactName={contactName} channelColor={channelColor} />
            )}
            ListHeaderComponent={
              activeTab === 'NOTES' ? (
                <View style={styles.notesSectionBanner}>
                  <StickyNote size={14} color="#D97706" />
                  <Text style={styles.notesSectionText}>📌 Internal Notes Section (Private Team Notes)</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {activeTab === 'NOTES'
                    ? 'No internal notes added yet. Use the composer below to leave a note for your team.'
                    : 'No messages yet.'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => syncMessages(false)}
                colors={[channelColor || colors.primary]}
                tintColor={channelColor || colors.primary}
              />
            }
          />
        )}

        {isTyping && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>Customer is typing...</Text>
          </View>
        )}

        <MessageComposer
          sending={sending}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          channelColor={channelColor}
          activeMode={activeTab}
          onModeChange={(mode) => setActiveTab(mode)}
        />
      </KeyboardAvoidingView>

      <WhatsAppTemplateModal
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSendTemplate={handleSendTemplate}
      />

      <CustomerProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        contactName={contactName}
        contactPhone={targetAddress}
        channel={channel}
      />

      <TransferModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransfer}
      />

      <AuditLogModal
        visible={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        loading={loadingAudit}
        convoId={convoId}
        auditLogs={auditLogs}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 6,
  },
  backButton: {
    padding: 2,
  },
  profileClick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  phoneBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  phoneText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  botBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  botBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  botToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  botToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transferText: {
    fontSize: 10,
    fontWeight: '600',
  },
  profileBtn: {
    padding: 4.5,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  typingBar: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  notesSectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  notesSectionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
