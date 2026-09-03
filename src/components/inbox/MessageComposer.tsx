import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../Text';
import { Send, Lock } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface MessageComposerProps {
  onSend: (text: string, isInternalNote: boolean) => void;
  onTyping?: (text: string) => void;
  sending: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, onTyping, sending }) => {
  const [text, setText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const handleTextChange = (val: string) => {
    setText(val);
    if (onTyping) onTyping(val);
  };

  const handleSend = () => {
    if (!text.trim() || sending) return;
    onSend(text.trim(), isInternalNote);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.noteToggle, isInternalNote && styles.noteToggleActive]}
        onPress={() => setIsInternalNote(!isInternalNote)}
      >
        <Lock size={14} color={isInternalNote ? '#EAB308' : colors.text.muted} />
        <Text style={[styles.noteToggleText, isInternalNote && styles.noteToggleTextActive]}>
          {isInternalNote ? 'Internal Note' : 'Reply'}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={isInternalNote ? 'Write an internal note for team...' : 'Type a message...'}
          placeholderTextColor={colors.text.muted}
          multiline
          style={[styles.input, isInternalNote && styles.noteInput]}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!text.trim() || sending}
          style={[
            styles.sendButton,
            isInternalNote ? styles.noteSendButton : styles.replySendButton,
            (!text.trim() || sending) && styles.disabledSend,
          ]}
          onPress={handleSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 8,
  },
  noteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
  },
  noteToggleActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  noteToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },
  noteToggleTextActive: {
    color: '#EAB308',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  noteInput: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replySendButton: {
    backgroundColor: colors.primary.main,
  },
  noteSendButton: {
    backgroundColor: '#EAB308',
  },
  disabledSend: {
    opacity: 0.5,
  },
});
