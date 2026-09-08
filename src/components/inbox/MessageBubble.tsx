import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Message } from '../../api/inbox';
import { useTheme } from '../../theme';
import { MessageSquare, AlertCircle, Check, CheckCheck, Clock } from 'lucide-react-native';

interface MessageBubbleProps {
  message: Message;
  contactName?: string;
  contactAvatar?: string;
  channelColor?: string;
  onPressButton?: (buttonText: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  contactName = 'Customer',
  contactAvatar,
  channelColor,
  onPressButton,
}) => {
  const { colors } = useTheme();
  const isInternal = message.message_type === 'INTERNAL';
  const isOutgoing = message.message_type === 'OUTGOING';
  const themeColor = channelColor || colors.primary;

  const renderDeliveryStatus = () => {
    if (!isOutgoing) return null;

    const status = (message.status || '').toUpperCase();
    const isTemp = message.id?.startsWith('temp_');

    if (status === 'FAILED') {
      return (
        <View style={styles.failedBadge}>
          <AlertCircle size={10} color="#FEE2E2" />
          <Text style={styles.failedText}>Failed</Text>
        </View>
      );
    }

    if (isTemp || status === 'PENDING') {
      return <Clock size={11} color="rgba(255, 255, 255, 0.65)" style={styles.statusIcon} />;
    }

    if (status === 'READ') {
      return <CheckCheck size={14} color="#38BDF8" style={styles.statusIcon} />;
    }

    if (status === 'DELIVERED' || status === 'RECEIVED') {
      return <CheckCheck size={14} color="rgba(255, 255, 255, 0.75)" style={styles.statusIcon} />;
    }

    // Default for SENT
    return <Check size={13} color="rgba(255, 255, 255, 0.75)" style={styles.statusIcon} />;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const extractMessageButtons = (m: any): string[] => {
    if (!m) return [];
    let btnList: any[] = [];
    if (Array.isArray(m.buttons) && m.buttons.length > 0) {
      btnList = m.buttons;
    } else if (m.metadata) {
      if (Array.isArray(m.metadata.buttons) && m.metadata.buttons.length > 0) {
        btnList = m.metadata.buttons;
      } else {
        const interactiveBtns = m.metadata?.payload?.interactive?.action?.buttons;
        if (Array.isArray(interactiveBtns) && interactiveBtns.length > 0) {
          btnList = interactiveBtns;
        }
      }
    }
    return btnList
      .map((b: any) => {
        if (typeof b === 'string') return b;
        return b.reply?.title || b.title || b.text || b.label || '';
      })
      .filter(Boolean);
  };

  const msgButtons = extractMessageButtons(message);

  if (isInternal) {
    return (
      <View style={styles.internalContainer}>
        <View style={styles.internalHeaderRow}>
          <MessageSquare size={13} color="#D97706" />
          <Text style={styles.internalHeader}>Internal Private Note • {message.sender_name || 'Team Member'}</Text>
        </View>
        <Text style={[styles.internalBody, { color: colors.textPrimary }]}>{message.body}</Text>
        <Text style={[styles.internalTime, { color: colors.textMuted }]}>{formatTime(message.created_at)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isOutgoing ? styles.outgoingRow : styles.incomingRow]}>
      <View
        style={[
          styles.bubble,
          isOutgoing
            ? { backgroundColor: themeColor, borderBottomRightRadius: 2 }
            : { backgroundColor: colors.card, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: colors.border },
        ]}
      >
        {!isOutgoing && Boolean(message.sender_name) && (
          <Text style={[styles.senderName, { color: themeColor }]}>{message.sender_name}</Text>
        )}
        <Text style={[styles.bodyText, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
          {(message.body || '').trim()}
        </Text>

        {msgButtons.length > 0 ? (
          <View style={styles.buttonList}>
            {msgButtons.map((btnText, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.3)' : themeColor,
                  },
                ]}
                onPress={() => onPressButton && onPressButton(btnText)}
              >
                <MessageSquare size={12} color={isOutgoing ? '#FFFFFF' : themeColor} />
                <Text
                  style={[
                    styles.optionText,
                    { color: isOutgoing ? '#FFFFFF' : themeColor },
                  ]}
                >
                  {btnText}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              { color: isOutgoing ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted },
            ]}
          >
            {formatTime(message.created_at)}
          </Text>
          {renderDeliveryStatus()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleRow: {
    marginVertical: 3,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  outgoingRow: {
    justifyContent: 'flex-end',
  },
  incomingRow: {
    justifyContent: 'flex-start',
  },
  avatarLeft: {
    marginBottom: 2,
  },
  avatarRight: {
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 14,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 19,
  },
  buttonList: {
    marginTop: 6,
    gap: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 2,
  },
  statusIcon: {
    marginLeft: 2,
  },
  failedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  failedText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  internalContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4,
  },
  internalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  internalHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  internalBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1E293B',
  },
  internalTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    color: '#B45309',
  },
});
