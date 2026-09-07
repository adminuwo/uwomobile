import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Modal } from '../Modal';
import { Text } from '../Text';
import { Button } from '../Button';
import { useTheme } from '../../theme';
import { crmApi } from '../../api/crm';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface ImportLeadsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `Name, Phone, Email, Channel
Aarav Mehta, +919876543210, aarav@example.com, WHATSAPP
Priya Sharma, +919812345678, priya@example.com, INSTAGRAM
Amit Verma, +919988776655, amit@example.com, FACEBOOK`;

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ visible, onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    setResultMsg(null);
  };

  const handleImport = async () => {
    if (!csvText.trim() || importing) return;

    setResultMsg(null);
    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    // Check if first line is a header
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes('name') || firstLineLower.includes('phone') || firstLineLower.includes('email');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    if (dataLines.length === 0) {
      setResultMsg('No valid lead rows found in CSV text.');
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: dataLines.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

      const name = cols[0] || `Lead ${i + 1}`;
      const phone = cols[1] || undefined;
      const email = cols[2] || undefined;
      const channel = cols[3] ? cols[3].toUpperCase() : 'WHATSAPP';

      try {
        await crmApi.createContact({
          name,
          phone_number: phone,
          email,
          preferred_channel: channel,
          stage: 'NEW',
        });
        successCount++;
      } catch (err) {
        failCount++;
      }

      setProgress({ current: i + 1, total: dataLines.length });
    }

    setImporting(false);
    setProgress(null);
    setResultMsg(`Successfully imported ${successCount} leads! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
    onSuccess();
  };

  return (
    <Modal visible={visible} title="Import CRM Leads (CSV)" onClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FileSpreadsheet size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Paste CSV data below with columns: <Text style={{ fontWeight: '700' }}>Name, Phone, Email, Channel</Text>
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.75} style={styles.sampleBtn} onPress={handleLoadSample}>
          <Upload size={14} color={colors.primary} />
          <Text style={[styles.sampleBtnText, { color: colors.primary }]}>Load Sample CSV Template</Text>
        </TouchableOpacity>

        <TextInput
          value={csvText}
          onChangeText={(txt) => {
            setCsvText(txt);
            setResultMsg(null);
          }}
          placeholder="Name, Phone, Email, Channel&#10;John Doe, +919876543210, john@example.com, WHATSAPP"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={6}
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
        />

        {progress ? (
          <View style={styles.progressRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.progressText, { color: colors.textPrimary }]}>
              Importing {progress.current} of {progress.total} leads...
            </Text>
          </View>
        ) : null}

        {resultMsg ? (
          <View style={styles.resultRow}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={[styles.resultText, { color: '#10B981' }]}>{resultMsg}</Text>
          </View>
        ) : null}

        <Button
          title={importing ? 'Importing...' : 'Start Batch Import'}
          loading={importing}
          disabled={!csvText.trim() || importing}
          onPress={handleImport}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  sampleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    maxHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    fontFamily: 'Platform',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
