import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Modal } from '../Modal';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { History, User, Clock, ShieldAlert, ArrowRightLeft, StickyNote, Lock, MessageSquare, Eye } from 'lucide-react-native';

export interface AuditLogItem {
  id?: string;
  event_type: string;
  actor_name?: string;
  actor_username?: string;
  created_at?: string;
  details?: Record<string, any>;
}

interface AuditLogModalProps {
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  convoId?: string;
  auditLogs?: AuditLogItem[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  visible,
  onClose,
  loading = false,
  convoId = 'Chat',
  auditLogs = [],
}) => {
  const { colors } = useTheme();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'TAKEOVER':
        return <ShieldAlert size={14} color="#EF4444" />;
      case 'TRANSFERRED':
        return <ArrowRightLeft size={14} color="#F59E0B" />;
      case 'NOTE_ADDED':
        return <StickyNote size={14} color="#10B981" />;
      case 'LOCKED':
      case 'UNLOCKED':
        return <Lock size={14} color="#6366F1" />;
      case 'VIEWED':
        return <Eye size={14} color="#3B82F6" />;
      case 'REPLIED':
        return <MessageSquare size={14} color="#10B981" />;
      default:
        return <History size={14} color="#64748B" />;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Just now';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <Modal visible={visible} title="Conversation Audit Log" onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Complete event timeline for #{convoId}
        </Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading audit logs...</Text>
          </View>
        ) : auditLogs.length > 0 ? (
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.timelineList}>
              {auditLogs.map((log, idx) => (
                <View key={log.id || idx} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.actorRow}>
                      {getEventIcon(log.event_type)}
                      <Text style={[styles.actorName, { color: colors.textPrimary }]}>
                        {log.actor_name || log.actor_username || 'System'}
                      </Text>
                    </View>
                    <View style={styles.timeRow}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(log.created_at)}</Text>
                    </View>
                  </View>

                  <Text style={[styles.eventType, { color: colors.primary }]}>
                    Event: <Text style={{ fontWeight: '700' }}>{log.event_type}</Text>
                  </Text>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <View style={[styles.detailsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {Object.entries(log.details).map(([k, v]) => (
                        <View key={k} style={styles.detailRow}>
                          <Text style={[styles.detailKey, { color: colors.textMuted }]}>{k.replace('_', ' ')}:</Text>
                          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{String(v)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No audit logs recorded for this conversation yet.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 450,
    gap: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  scroll: {
    maxHeight: 380,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
  timelineList: {
    gap: 10,
    paddingBottom: 10,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  eventType: {
    fontSize: 12,
  },
  detailsBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailKey: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
});
