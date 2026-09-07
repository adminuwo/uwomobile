import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { useTheme } from '../../src/theme';
import { teamApi, TeamChatMessage } from '../../src/api/team';
import { useSessionStore } from '../../src/stores/sessionStore';
import { Send, Users, MessageSquare } from 'lucide-react-native';

export default function TeamChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [inputText, setInputText] = useState('');

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['teamChatMessages'],
    queryFn: () => teamApi.getChatMessages(),
    refetchInterval: 5000, // Poll every 5 seconds for real-time team chat
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => teamApi.sendChatMessage(body),
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['teamChatMessages'] });
    },
  });

  const handleSend = () => {
    if (!inputText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Team Workspace Chat"
        showBack
        onBackPress={() => router.back()}
        rightElement={
          <View style={styles.headerBadge}>
            <Users size={16} color={colors.primary} />
            <Text variant="caption" weight="bold" color={colors.primary}>
              Internal
            </Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text variant="h3" color={colors.textPrimary}>
              No Team Messages Yet
            </Text>
            <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
              Start an internal conversation with your team members, agents, and supervisors.
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={isLoading}
            onRefresh={refetch}
            renderItem={({ item }) => {
              const isMe = item.sender_email === currentUser?.email || item.sender_name === currentUser?.username;
              return (
                <View
                  style={[
                    styles.msgWrapper,
                    isMe ? styles.myWrapper : styles.theirWrapper,
                  ]}
                >
                  {!isMe && (
                    <Text variant="caption" weight="bold" color={colors.primary} style={{ marginBottom: 2 }}>
                      {item.sender_name || item.sender_email || 'Team Member'}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.msgBubble,
                      isMe
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                    ]}
                  >
                    <Text variant="body" color={isMe ? '#FFFFFF' : colors.textPrimary}>
                      {item.body}
                    </Text>
                    <Text
                      variant="caption"
                      color={isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted}
                      style={styles.timeText}
                    >
                      {new Date(item.created_at || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Type message to team..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.primary : colors.border },
            ]}
            disabled={!inputText.trim() || sendMutation.isPending}
            onPress={handleSend}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Send size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  msgWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
  },
  theirWrapper: {
    alignSelf: 'flex-start',
  },
  msgBubble: {
    padding: 12,
    borderRadius: 14,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
