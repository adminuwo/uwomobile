import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Modal } from '../../src/components/Modal';
import { Input } from '../../src/components/Input';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import { LifeBuoy, Plus, MessageSquare, CheckCircle, Clock } from 'lucide-react-native';

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/support/messages/');
      const list = Array.isArray(res) ? res : res?.results || [];
      setTickets(list);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post('/api/support/messages/', {
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: 'OPEN',
      });

      setCreateModalVisible(false);
      setSubject('');
      setMessage('');
      fetchTickets(true);
    } catch (err) {
      console.warn('Ticket error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Help & Support Desk"
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Ticket
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTickets(true)} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <LifeBuoy size={42} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Support Tickets
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center" style={{ marginTop: 4 }}>
                Have questions or need technical help? Open a support ticket to chat with our engineering desk.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.ticketCard}>
            <View style={styles.headerRow}>
              <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ flex: 1 }}>
                {item.subject}
              </Text>
              <Badge
                label={item.status}
                variant={item.status === 'RESOLVED' ? 'success' : item.status === 'IN_PROGRESS' ? 'info' : 'warning'}
              />
            </View>

            <Text variant="body" color={colors.textPrimary} style={styles.messageText}>
              {item.message}
            </Text>

            <View style={styles.footerRow}>
              <Badge label={`Priority: ${item.priority}`} variant="neutral" />
              <Text variant="caption" color={colors.textMuted}>
                {item.created_at?.split('T')[0]}
              </Text>
            </View>
          </Card>
        )}
      />

      {/* Create Ticket Modal */}
      <Modal visible={createModalVisible} title="Open Support Ticket" onClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalBody}>
          <Input label="Ticket Subject" placeholder="e.g. Issue with WhatsApp Webhook Sync" value={subject} onChangeText={setSubject} />
          <Input
            label="Detailed Description"
            placeholder="Describe the issue, error code or feature request..."
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 4 }}>
            Ticket Priority
          </Text>
          <View style={styles.priorityRow}>
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  priority === p && { backgroundColor: colors.primary },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text variant="caption" weight="bold" color={priority === p ? '#FFF' : colors.textPrimary}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Submit Support Ticket" loading={submitting} onPress={handleCreateTicket} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  ticketCard: {
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  messageText: {
    lineHeight: 20,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBody: {
    gap: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
