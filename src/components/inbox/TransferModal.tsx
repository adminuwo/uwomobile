import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { UserCheck, ShieldAlert, Building2 } from 'lucide-react-native';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  onTransfer: (payload: { agent_id?: string; department?: string; note?: string }) => Promise<void>;
}

const DEPARTMENTS = ['Support Team', 'Sales Desk', 'Billing Dept', 'Technical Support'];

export const TransferModal: React.FC<TransferModalProps> = ({ visible, onClose, onTransfer }) => {
  const { colors } = useTheme();
  const [selectedDept, setSelectedDept] = useState<string>('Support Team');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onTransfer({ department: selectedDept, note });
      onClose();
    } catch (err) {
      console.warn('Transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} title="Transfer Conversation" onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select Target Department</Text>

        <View style={styles.deptGrid}>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <TouchableOpacity
                key={dept}
                activeOpacity={0.75}
                style={[
                  styles.deptCard,
                  {
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedDept(dept)}
              >
                <Building2 size={16} color={isSelected ? colors.primary : colors.textMuted} />
                <Text
                  style={[
                    styles.deptText,
                    { color: isSelected ? colors.primary : colors.textPrimary },
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Transfer Note (Optional)"
          placeholder="Reason for transfer or notes for agent..."
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Button title="Confirm Transfer" loading={loading} onPress={handleConfirm} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: '45%',
  },
  deptText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
