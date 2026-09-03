import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Avatar } from '../../../src/components/Avatar';
import { ChannelBadge } from '../../../src/components/inbox/ChannelBadge';
import { MessageBubble } from '../../../src/components/inbox/MessageBubble';
import { MessageComposer } from '../../../src/components/inbox/MessageComposer';
import { inboxApi, Message } from '../../../src/api/inbox';
import { inboxWebSocket } from '../../../src/services/inboxWebSocket';
import { colors } from '../../../src/theme/colors';
import { ArrowLeft, UserCheck } from 'lucide-react-native';

export default function ConversationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; rawAddress?: string; name?: string; channel?: string }>();

  const convoId = params.id;
  const targetAddress = params.rawAddress || params.id;
  const contactName = params.name || 'Customer';
  const channel = params.channel || 'WHATSAPP';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const fetchChatHistory = useCallback(async () => {
    if (!targetAddress) return;
    try {
      setLoading(true);
      const res = await inboxApi.getMessages({ contactId: targetAddress, limit: 50, offset: 0 });
      setMessages(res.messages);
    } catch (err) {
      console.warn('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Real-time WebSocket integration for live incoming messages & typing indicators
  useEffect(() => {
    const unsubscribe = inboxWebSocket.subscribe((data) => {
      if (data.type === 'new_message' && data.message) {
        const msg: Message = data.message;
        const isForThisChat =
          msg.from_address === targetAddress ||
          msg.to_address === targetAddress ||
          msg.from_address === convoId ||
          msg.to_address === convoId;

        if (isForThisChat) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      }

      if (data.type === 'typing_status' && data.conversation_id === convoId) {
        setIsTyping(Boolean(data.is_typing));
      }
    });

    // Broadcast viewing status
    inboxWebSocket.send({
      type: 'view_conversation',
      conversation_id: convoId,
    });

    return () => {
      unsubscribe();
    };
  }, [convoId, targetAddress]);

  const handleSendMessage = async (text: string, isInternalNote: boolean) => {
    if (!text.trim() || sending) return;

    setSending(true);
    const nowTs = Date.now();
    const optimisticMsg: Message = {
      id: `temp_${nowTs}`,
      from_address: 'Me',
      to_address: targetAddress,
      body: text,
      channel: channel,
      message_type: isInternalNote ? 'INTERNAL' : 'OUTGOING',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const serverMsg = await inboxApi.sendMessage({
        to_number: targetAddress,
        body: text,
        channel: channel,
        message_type: isInternalNote ? 'INTERNAL' : 'OUTGOING',
      });

      if (serverMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? serverMsg : m))
        );
      }
    } catch (err: any) {
      console.warn('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    if (!convoId || takingOver) return;
    try {
      setTakingOver(true);
      await inboxApi.takeoverConversation(convoId);
    } catch (err) {
      console.warn('Takeover error:', err);
    } finally {
      setTakingOver(false);
    }
  };

  const handleTyping = (text: string) => {
    if (text.length > 0) {
      inboxWebSocket.send({
        type: 'typing_status',
        conversation_id: convoId,
        is_typing: true,
      });
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <Avatar name={contactName} size="sm" />

        <View style={styles.headerInfo}>
          <Text numberOfLines={1} style={styles.headerName}>
            {contactName}
          </Text>
          <ChannelBadge channel={channel} size="sm" />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={takingOver}
          style={styles.takeoverButton}
          onPress={handleTakeover}
        >
          {takingOver ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <UserCheck size={18} color="#10B981" />
          )}
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: 10,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  takeoverButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
    backgroundColor: colors.background.secondary,
  },
  typingText: {
    fontSize: 12,
    color: colors.primary.light,
    fontStyle: 'italic',
  },
});
