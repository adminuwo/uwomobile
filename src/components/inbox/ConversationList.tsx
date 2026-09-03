import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ConversationRow } from './ConversationRow';
import { Conversation } from '../../api/inbox';
import { Skeleton } from '../Skeleton';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { MessageSquare } from 'lucide-react-native';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  refreshing: boolean;
  error?: string | null;
  onRefresh: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onLoadMore?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  refreshing,
  error,
  onRefresh,
  onSelectConversation,
  onLoadMore,
}) => {
  if (loading && !refreshing && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="90%" height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  if (!loading && conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Conversations Found"
        description="Incoming messages from WhatsApp, Instagram, Facebook, and YouTube will appear here."
      />
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConversationRow conversation={item} onPress={onSelectConversation} />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
});
