import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { useTheme } from '../../theme';
import { apiClient } from '../../api/client';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Users } from 'lucide-react-native';

export interface ImportedRecipient {
  name: string;
  phone: string;
  raw_phone?: string;
}

interface ExcelImportSectionProps {
  onRecipientsChange: (recipients: ImportedRecipient[], filename?: string) => void;
  recipientsCount: number;
}

export const ExcelImportSection: React.FC<ExcelImportSectionProps> = ({
  onRecipientsChange,
  recipientsCount,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<ImportedRecipient[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPickingRef = React.useRef(false);

  const handlePickDocument = async () => {
    if (isPickingRef.current || loading) {
      return;
    }
    isPickingRef.current = true;
    try {
      setErrorMsg(null);
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'text/csv', // .csv
          'text/comma-separated-values',
          'text/plain',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }

      const asset = res.assets[0];
      setFileName(asset.name);
      if (asset.size) {
        const kb = (asset.size / 1024).toFixed(1);
        setFileSize(`${kb} KB`);
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as any);

      const response: any = await apiClient.post('/api/campaigns/parse_excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsedRecipients: ImportedRecipient[] = response?.recipients || [];
      const count = response?.valid_count || parsedRecipients.length;

      if (count === 0) {
        setErrorMsg('No valid 10-15 digit phone numbers found in the sheet. Please check column headers.');
        setPreviewList([]);
        onRecipientsChange([], asset.name);
      } else {
        setTotalRows(response?.total_rows || count);
        setPreviewList(parsedRecipients);
        onRecipientsChange(parsedRecipients, asset.name);
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      // Gracefully handle concurrent tap or system picker cancelation
      if (
        msg.toLowerCase().includes('in progress') ||
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('await other document picking')
      ) {
        console.log('[ExcelImportSection] Document picking concurrency handled cleanly.');
        return;
      }
      console.warn('Excel parse error:', err);
      const displayMsg = err?.response?.data?.error || err?.message || 'Failed to parse Excel/CSV file';
      setErrorMsg(displayMsg);
      onRecipientsChange([], undefined);
    } finally {
      isPickingRef.current = false;
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    setFileSize(null);
    setPreviewList([]);
    setTotalRows(0);
    setErrorMsg(null);
    setShowAllPreview(false);
    onRecipientsChange([], undefined);
  };

  return (
    <View style={styles.container}>
      {!fileName && (
        <TouchableOpacity
          style={[styles.compactUploadCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={handlePickDocument}
          activeOpacity={0.75}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 8 }}>
                Scanning & Extracting Phone Numbers...
              </Text>
            </View>
          ) : (
            <View style={styles.compactUploadRow}>
              <View style={[styles.compactIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <FileSpreadsheet size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text variant="caption" weight="bold" color={colors.textPrimary}>
                  Upload Excel / CSV Numbers
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                  Tap to browse .xlsx or .csv file
                </Text>
              </View>
              <View style={[styles.browseMiniBtn, { backgroundColor: colors.primary }]}>
                <Upload size={12} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 11, marginLeft: 4 }}>
                  Browse
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}

      {errorMsg && (
        <View style={[styles.errorCard, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
          <AlertCircle size={15} color="#DC2626" />
          <Text variant="caption" weight="bold" color="#B91C1C" style={{ flex: 1, fontSize: 11 }}>
            {errorMsg}
          </Text>
        </View>
      )}

      {fileName && !loading && (
        <View style={[styles.compactResultCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.fileHeader}>
            <View style={[styles.compactIconCircle, { backgroundColor: '#10B98118' }]}>
              <FileSpreadsheet size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="caption" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                {fileName}
              </Text>
              <Text variant="caption" color="#059669" style={{ fontSize: 11, fontWeight: '700' }}>
                ✅ {recipientsCount} Valid Phone Numbers Ready
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearFile} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  compactUploadCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  compactUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  compactResultCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeBtn: {
    padding: 6,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
});
