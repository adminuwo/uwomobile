import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../Text';
import { Send, MessageSquare, StickyNote } from 'lucide-react-native';
import { useTheme } from '../../theme';

interface MessageComposerProps {
  onSend: (text: string, isInternalNote: boolean) => void;
  onTyping?: (text: string) => void;
  sending: boolean;
  channelColor?: string;
  activeMode?: 'MESSAGES' | 'NOTES';
  onModeChange?: (mode: 'MESSAGES' | 'NOTES') => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTyping,
  sending,
  channelColor,
  activeMode,
  onModeChange,
}) => {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [localInternalNote, setLocalInternalNote] = useState(false);
  const isInternalNote = activeMode !== undefined ? activeMode === 'NOTES' : localInternalNote;
  const activeColor = channelColor || colors.primary;

  const handleTextChange = (val: string) => {
    setText(val);
    if (onTyping) onTyping(val);
  };

  const handleModeToggle = (isNote: boolean) => {
    setLocalInternalNote(isNote);
    if (onModeChange) {
      onModeChange(isNote ? 'NOTES' : 'MESSAGES');
    }
  };

  const handleSend = () => {
    if (!text.trim() || sending) return;
    onSend(text.trim(), isInternalNote);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {/* Mode Selector: Reply vs Internal Note Side-by-Side */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            styles.modeBtn,
            !isInternalNote
              ? { backgroundColor: `${activeColor}15`, borderColor: activeColor }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleModeToggle(false)}
        >
          <MessageSquare size={12} color={!isInternalNote ? activeColor : colors.textMuted} />
          <Text style={[styles.modeText, { color: !isInternalNote ? activeColor : colors.textMuted }]}>
            Reply
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            styles.modeBtn,
            isInternalNote
              ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleModeToggle(true)}
        >
          <StickyNote size={12} color={isInternalNote ? '#D97706' : colors.textMuted} />
          <Text style={[styles.modeText, { color: isInternalNote ? '#D97706' : colors.textMuted }]}>
            Internal Note
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={isInternalNote ? 'Write a private internal note for team...' : 'Type a message...'}
          placeholderTextColor={colors.textMuted}
          multiline
          style={[
            styles.input,
            {
              backgroundColor: isInternalNote ? 'rgba(245, 158, 11, 0.08)' : colors.surface,
              color: colors.textPrimary,
              borderColor: isInternalNote ? '#F59E0B' : colors.border,
            },
          ]}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!text.trim() || sending}
          style={[
            styles.sendButton,
            { backgroundColor: isInternalNote ? '#D97706' : activeColor },
            (!text.trim() || sending) && styles.disabledSend,
          ]}
          onPress={handleSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 13,
    borderWidth: 1,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSend: {
    opacity: 0.5,
  },
});
