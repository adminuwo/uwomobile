import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { ContactFollowUp, FollowUpStatus } from '../../api/crm';
import { Phone, MessageSquare, Users, Mail, MoreHorizontal, Check, X } from 'lucide-react-native';

const TYPE_LABELS: Record<string, string> = {
  CALL: 'Call',
  MESSAGE: 'Message',
  MEETING: 'Meeting',
  EMAIL: 'Email',
  OTHER: 'Other',
};

interface FollowUpCardProps {
  item: ContactFollowUp;
  contactId: string;
  onUpdate: (followUpId: string, data: { status: FollowUpStatus }) => Promise<void>;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (diffMs < 0) {
    const overdueMins = Math.abs(Math.round(diffMs / 60000));
    if (overdueMins < 60) return `Overdue by ${overdueMins}m`;
    const overdueHrs = Math.abs(Math.round(diffMs / 3600000));
    if (overdueHrs < 24) return `Overdue by ${overdueHrs}h`;
    const overdueDays = Math.abs(Math.round(diffMs / 86400000));
    return `Overdue by ${overdueDays}d`;
  }
  if (diffHours < 1) return 'Due soon';
  if (diffHours < 24) return `Today ${timeStr}`;
  if (diffHours < 48) return `Tomorrow ${timeStr}`;
  return `${dateStr} ${timeStr}`;
}

function TypeIcon({ type, color }: { type: string; color: string }) {
  const size = 14;
  switch (type) {
    case 'CALL': return <Phone size={size} color={color} />;
    case 'MESSAGE': return <MessageSquare size={size} color={color} />;
    case 'MEETING': return <Users size={size} color={color} />;
    case 'EMAIL': return <Mail size={size} color={color} />;
    default: return <MoreHorizontal size={size} color={color} />;
  }
}

export function FollowUpCard({ item, contactId, onUpdate }: FollowUpCardProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState<'done' | 'cancel' | null>(null);

  const isOverdue = item.is_overdue;
  const isDone = item.status === 'DONE';
  const isCancelled = item.status === 'CANCELLED';
  const isPending = item.status === 'PENDING';

  const statusColor = isDone
    ? '#10B981'
    : isCancelled
    ? colors.textMuted
    : isOverdue
    ? '#EF4444'
    : colors.primary;

  const statusLabel = isDone
    ? '✅ Done'
    : isCancelled
    ? 'Cancelled'
    : isOverdue
    ? '🔴 Overdue'
    : '🟡 Pending';

  const handleAction = async (status: FollowUpStatus) => {
    const key = status === 'DONE' ? 'done' : 'cancel';
    setLoading(key);
    try {
      await onUpdate(item.id, { status });
    } finally {
      setLoading(null);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isOverdue && isPending ? '#EF4444' : colors.border,
          borderWidth: isOverdue && isPending ? 1.5 : 1,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: statusColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.typeChip, { backgroundColor: statusColor + '22' }]}>
            <TypeIcon type={item.follow_up_type} color={statusColor} />
            <Text style={[styles.typeLabel, { color: statusColor }]}>
              {TYPE_LABELS[item.follow_up_type] || item.follow_up_type}
            </Text>
          </View>
          <Text style={[styles.statusBadge, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              textDecorationLine: isDone ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text style={[styles.dateText, { color: isOverdue && isPending ? '#EF4444' : colors.textMuted }]}>
          🕐 {formatDateTime(item.scheduled_at)}
        </Text>

        {!!item.note && (
          <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={2}>
            📝 {item.note}
          </Text>
        )}

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10B98122', borderColor: '#10B981' }]}
              onPress={() => handleAction('DONE')}
              disabled={!!loading}
            >
              {loading === 'done' ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <Check size={13} color="#10B981" />
                  <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Mark Done</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF444422', borderColor: '#EF4444' }]}
              onPress={() => handleAction('CANCELLED')}
              disabled={!!loading}
            >
              {loading === 'cancel' ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <X size={13} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
