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
import { FileCheck, Plus, CheckCircle, XCircle, Clock } from 'lucide-react-native';

export interface WorkReport {
  id: string;
  user_name: string;
  user_email: string;
  report_date: string;
  hours_worked: number;
  tasks_summary: string;
  blockers?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form State
  const [hours, setHours] = useState('8');
  const [tasks, setTasks] = useState('');
  const [blockers, setBlockers] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/team/reports/');
      const list = Array.isArray(res) ? res : res?.results || [];
      setReports(list);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSubmitReport = async () => {
    if (!tasks.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post('/api/team/reports/', {
        hours_worked: parseFloat(hours) || 8,
        tasks_summary: tasks.trim(),
        blockers: blockers.trim() || undefined,
      });

      setCreateModalVisible(false);
      setTasks('');
      setBlockers('');
      fetchReports(true);
    } catch (err) {
      console.warn('Report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await apiClient.post('/api/team/approvals/', {
        report_id: id,
        action,
      });
      fetchReports(true);
    } catch (err) {
      console.warn('Approval error:', err);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Work Reports & Activity"
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              Submit Report
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchReports(true)} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <FileCheck size={42} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Work Reports
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center" style={{ marginTop: 4 }}>
                Submit daily operational work reports for supervisor tracking and approval.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.reportCard}>
            <View style={styles.headerRow}>
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                {item.user_name || item.user_email || 'Staff Member'}
              </Text>
              <Badge
                label={item.status}
                variant={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'error' : 'warning'}
              />
            </View>

            <Text variant="caption" color={colors.textMuted} style={styles.dateText}>
              Date: {item.report_date || item.created_at?.split('T')[0]} ({item.hours_worked || 8} hrs logged)
            </Text>

            <Text variant="body" color={colors.textPrimary} style={styles.summaryText}>
              {item.tasks_summary}
            </Text>

            {item.blockers ? (
              <Text variant="caption" color={colors.error} style={styles.blockerText}>
                Blockers: {item.blockers}
              </Text>
            ) : null}

            {item.status === 'PENDING' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#10B98115' }]}
                  onPress={() => handleApproval(item.id, 'APPROVE')}
                >
                  <CheckCircle size={14} color="#10B981" />
                  <Text variant="caption" weight="bold" color="#10B981">
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#EF444415' }]}
                  onPress={() => handleApproval(item.id, 'REJECT')}
                >
                  <XCircle size={14} color="#EF4444" />
                  <Text variant="caption" weight="bold" color="#EF4444">
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}
      />

      {/* Submit Report Modal */}
      <Modal visible={createModalVisible} title="Submit Daily Work Report" onClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalBody}>
          <Input label="Hours Worked Today" placeholder="8" keyboardType="numeric" value={hours} onChangeText={setHours} />
          <Input
            label="Tasks Completed & Work Summary"
            placeholder="Summarize customer inquiries handled, workflows tested, etc."
            multiline
            numberOfLines={4}
            value={tasks}
            onChangeText={setTasks}
          />
          <Input
            label="Blockers / Issues Faced (Optional)"
            placeholder="Any system bugs or pending API approvals?"
            value={blockers}
            onChangeText={setBlockers}
          />

          <Button title="Submit Daily Work Report" loading={submitting} onPress={handleSubmitReport} />
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
  reportCard: {
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateText: {
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 20,
    marginBottom: 8,
  },
  blockerText: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modalBody: {
    gap: 12,
  },
});
