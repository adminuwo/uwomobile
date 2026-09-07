import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { ChannelBadge } from './ChannelBadge';
import { Conversation } from '../../api/inbox';
import { useTheme } from '../../theme';

interface ConversationRowProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({ conversation, onPress }) => {
  const { colors } = useTheme();

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.borderMuted || colors.border,
        },
      ]}
      onPress={() => onPress(conversation)}
    >
      <Avatar name={conversation.name} size="md" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
            {conversation.name}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(conversation.time)}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text numberOfLines={1} style={[styles.lastMessage, { color: colors.textSecondary }]}>
            {conversation.lastMessage}
          </Text>
          <View style={styles.badgeContainer}>
            <ChannelBadge channel={conversation.channel} size="sm" />
            {conversation.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>
                  {conversation.unread > 99 ? '99+' : conversation.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastMessage: {
    fontSize: 13,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
