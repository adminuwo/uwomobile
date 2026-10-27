import React from 'react';
import { FlatList, View, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionTitle?: string;
  onEmptyAction?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  refreshing,
  error,
  onRefresh,
  onSelectConversation,
  onLoadMore,
  emptyTitle,
  emptyDescription,
  emptyActionTitle,
  onEmptyAction,
}) => {
  const insets = useSafeAreaInsets();
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
      <FlatList
        data={[]}
        renderItem={null}
        ListEmptyComponent={
          <EmptyState
            icon={MessageSquare}
            title={emptyTitle || "No Conversations Found"}
            description={
              emptyDescription ||
              "Incoming messages from WhatsApp, Instagram, Facebook, and YouTube will appear here."
            }
            actionTitle={emptyActionTitle || "Refresh"}
            onAction={onEmptyAction || onRefresh}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  }

  return (
    <FlatList
      style={styles.list}
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
      contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
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
