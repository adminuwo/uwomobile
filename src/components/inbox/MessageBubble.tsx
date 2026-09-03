import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { Message } from '../../api/inbox';
import { colors } from '../../theme/colors';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isInternal = message.message_type === 'INTERNAL';
  const isOutgoing = message.message_type === 'OUTGOING';

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isInternal) {
    return (
      <View style={styles.internalContainer}>
        <Text style={styles.internalHeader}>🔒 Internal Note by {message.sender_name || 'Team Member'}</Text>
        <Text style={styles.internalBody}>{message.body}</Text>
        <Text style={styles.internalTime}>{formatTime(message.created_at)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleWrapper, isOutgoing ? styles.outgoingWrapper : styles.incomingWrapper]}>
      <View style={[styles.bubble, isOutgoing ? styles.outgoingBubble : styles.incomingBubble]}>
        {!isOutgoing && message.sender_name && (
          <Text style={styles.senderName}>{message.sender_name}</Text>
        )}
        <Text style={[styles.bodyText, isOutgoing ? styles.outgoingText : styles.incomingText]}>
          {message.body}
        </Text>
        <Text style={[styles.timeText, isOutgoing ? styles.outgoingTime : styles.incomingTime]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  outgoingWrapper: {
    justifyContent: 'flex-end',
  },
  incomingWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  outgoingBubble: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 2,
  },
  incomingBubble: {
    backgroundColor: colors.surface.card,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.light,
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  outgoingText: {
    color: '#FFFFFF',
  },
  incomingText: {
    color: colors.text.primary,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  outgoingTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  incomingTime: {
    color: colors.text.muted,
  },
  internalContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    gap: 4,
  },
  internalHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EAB308',
  },
  internalBody: {
    fontSize: 13,
    color: colors.text.primary,
  },
  internalTime: {
    fontSize: 10,
    color: colors.text.muted,
    alignSelf: 'flex-end',
  },
});
