import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../Text';
import { Send, MessageSquare, StickyNote, Paperclip, X, FileText } from 'lucide-react-native';
import { useTheme } from '../../theme';
import * as DocumentPicker from 'expo-document-picker';

export interface ComposerFileAttachment {
  uri: string;
  name: string;
  type?: string;
  size?: number;
}

interface MessageComposerProps {
  onSend: (text: string, isInternalNote: boolean, file?: ComposerFileAttachment | null) => void;
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
  const [selectedFile, setSelectedFile] = useState<ComposerFileAttachment | null>(null);
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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/*', '*/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        });
      }
    } catch (err: any) {
      console.warn('Error picking document:', err);
    }
  };

  const canSend = (Boolean(text.trim()) || Boolean(selectedFile)) && !sending;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim(), isInternalNote, selectedFile);
    setText('');
    setSelectedFile(null);
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

      {/* Selected Document Attachment Pill */}
      {selectedFile ? (
        <View
          style={[
            styles.fileChip,
            {
              backgroundColor: isInternalNote ? '#FEF3C7' : '#EFF6FF',
              borderColor: isInternalNote ? '#F59E0B' : '#BFDBFE',
            },
          ]}
        >
          <FileText size={15} color={isInternalNote ? '#D97706' : '#2563EB'} />
          <Text numberOfLines={1} style={[styles.fileName, { color: isInternalNote ? '#92400E' : '#1E40AF' }]}>
            {selectedFile.name}
          </Text>
          <TouchableOpacity onPress={() => setSelectedFile(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={15} color={isInternalNote ? '#D97706' : '#2563EB'} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        {/* Paperclip attachment button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.attachButton,
            {
              backgroundColor: selectedFile ? (isInternalNote ? '#FEF3C7' : '#EFF6FF') : colors.surface,
              borderColor: selectedFile ? (isInternalNote ? '#F59E0B' : '#2563EB') : colors.border,
            },
          ]}
          onPress={handlePickDocument}
        >
          <Paperclip size={18} color={selectedFile ? (isInternalNote ? '#D97706' : '#2563EB') : colors.textMuted} />
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={
            selectedFile
              ? 'Add a caption for document...'
              : isInternalNote
              ? 'Write a private internal note for team...'
              : 'Type a message...'
          }
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
          disabled={!canSend}
          style={[
            styles.sendButton,
            { backgroundColor: isInternalNote ? '#D97706' : activeColor },
            !canSend && styles.disabledSend,
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
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
