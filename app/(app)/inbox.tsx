import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { ChannelFilterBar, ChannelFilter } from '../../src/components/inbox/ChannelFilterBar';
import { ConversationList } from '../../src/components/inbox/ConversationList';
import { inboxApi, Conversation } from '../../src/api/inbox';
import { inboxWebSocket } from '../../src/services/inboxWebSocket';

export default function InboxScreen() {
  const router = useRouter();
  const [selectedChannel, setSelectedChannel] = useState<ChannelFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await inboxApi.getConversations({
        channel: selectedChannel,
        search: searchQuery,
        limit: 30,
        offset: 0,
      });

      setConversations(res.conversations);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChannel, searchQuery]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to real-time WebSocket for live auto-bumping of new messages
  useEffect(() => {
    const unsubscribe = inboxWebSocket.subscribe((data) => {
      if (data.type === 'new_message' && data.message) {
        const msg = data.message;
        const contactAddr = msg.message_type === 'INCOMING' ? msg.from_address : msg.to_address;

        setConversations((prev) => {
          const addrLower = String(contactAddr || '').toLowerCase();
          const existingIdx = prev.findIndex(
            (c) =>
              String(c.rawAddress || '').toLowerCase() === addrLower ||
              String(c.id || '').toLowerCase() === addrLower
          );

          if (existingIdx !== -1) {
            const updatedItem: Conversation = {
              ...prev[existingIdx],
              lastMessage: msg.body || prev[existingIdx].lastMessage,
              time: msg.created_at || new Date().toISOString(),
              unread: prev[existingIdx].unread + (msg.message_type === 'INCOMING' ? 1 : 0),
            };
            const remaining = prev.filter((_, idx) => idx !== existingIdx);
            return [updatedItem, ...remaining];
          } else {
            const newItem: Conversation = {
              id: String(contactAddr),
              name: msg.sender_name || contactAddr,
              rawAddress: String(contactAddr),
              lastMessage: msg.body || 'New message',
              time: msg.created_at || new Date().toISOString(),
              unread: 1,
              channel: (msg.channel || 'WHATSAPP').toUpperCase(),
              status: 'OPEN',
            };
            return [newItem, ...prev];
          }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectConversation = (conversation: Conversation) => {
    const rawAddress = conversation.contactObj?.phone_number || conversation.contactObj?.platform_id || conversation.rawAddress || conversation.id;
    router.push({
      pathname: '/(app)/conversation/[id]' as any,
      params: {
        id: conversation.id,
        rawAddress: rawAddress,
        name: conversation.name,
        channel: conversation.channel,
      },
    });
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Unified Inbox" />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search messages, numbers, or contacts..."
        />
      </View>

      <ChannelFilterBar
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />

      <ConversationList
        conversations={conversations}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRefresh={() => loadConversations(true)}
        onSelectConversation={handleSelectConversation}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
