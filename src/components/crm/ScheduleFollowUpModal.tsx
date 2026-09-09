import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '../Text';
import { Input } from '../Input';
import { Button } from '../Button';
import { useTheme } from '../../theme';
import { CreateFollowUpPayload, FollowUpType } from '../../api/crm';
import { Phone, MessageSquare, Users, Mail, MoreHorizontal, X, Calendar } from 'lucide-react-native';

interface ScheduleFollowUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: CreateFollowUpPayload) => Promise<void>;
}

const TYPES: { id: FollowUpType; label: string; icon: (c: string) => React.ReactNode }[] = [
  { id: 'CALL', label: 'Call', icon: (c) => <Phone size={16} color={c} /> },
  { id: 'MESSAGE', label: 'Message', icon: (c) => <MessageSquare size={16} color={c} /> },
  { id: 'MEETING', label: 'Meeting', icon: (c) => <Users size={16} color={c} /> },
  { id: 'EMAIL', label: 'Email', icon: (c) => <Mail size={16} color={c} /> },
  { id: 'OTHER', label: 'Other', icon: (c) => <MoreHorizontal size={16} color={c} /> },
];

// Preset quick-schedule options
const QUICK_TIMES = [
  { label: 'In 1 hour', hours: 1 },
  { label: 'In 3 hours', hours: 3 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'In 3 days', hours: 72 },
  { label: 'Next week', hours: 168 },
];

export function ScheduleFollowUpModal({ visible, onClose, onSave }: ScheduleFollowUpModalProps) {
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<FollowUpType>('CALL');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow by default
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const applyQuickTime = (hours: number) => {
    setScheduledAt(new Date(Date.now() + hours * 60 * 60 * 1000));
  };

  const formatPreview = (d: Date) =>
    d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the follow-up.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({
        follow_up_type: selectedType,
        title: title.trim(),
        note: note.trim() || undefined,
        scheduled_at: scheduledAt.toISOString(),
      });
      // Reset
      setTitle('');
      setNote('');
      setSelectedType('CALL');
      setScheduledAt(new Date(Date.now() + 24 * 60 * 60 * 1000));
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to schedule follow-up.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                📅 Schedule Follow-Up
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Set a reminder to follow up with this lead
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Type Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedType(t.id)}
                  >
                    {t.icon(isSelected ? '#fff' : colors.textMuted)}
                    <Text style={[styles.typeChipLabel, { color: isSelected ? '#fff' : colors.textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Title *</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Call to discuss pricing"
            />

            {/* Note */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Note (optional)</Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="Any context or details..."
              multiline
              numberOfLines={3}
            />

            {/* Quick Time Picker */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Schedule</Text>
            <View style={styles.quickRow}>
              {QUICK_TIMES.map((qt) => (
                <TouchableOpacity
                  key={qt.label}
                  style={[styles.quickChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => applyQuickTime(qt.hours)}
                >
                  <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>{qt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Scheduled Time Preview */}
            <View style={[styles.timePreview, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
              <Calendar size={16} color={colors.primary} />
              <Text style={[styles.timePreviewText, { color: colors.primary }]}>
                {formatPreview(scheduledAt)}
              </Text>
            </View>

            {/* Error */}
            {!!error && (
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.footerBtn}
            />
            <Button
              title="Schedule"
              loading={saving}
              onPress={handleSave}
              style={styles.footerBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 8,
    paddingBottom: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  timePreviewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
  },
});
