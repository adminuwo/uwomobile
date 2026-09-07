import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Modal } from '../Modal';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { useTheme } from '../../theme';
import { Contact } from '../../api/crm';
import { Download, Copy, Check, FileSpreadsheet, FileText, ChevronDown, ChevronUp, Share2 } from 'lucide-react-native';
import { downloadFile, shareFile } from '../../services/fileDownload';

interface ExportLeadsModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: Contact[];
}

export const ExportLeadsModal: React.FC<ExportLeadsModalProps> = ({ visible, onClose, contacts }) => {
  const { colors } = useTheme();
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showRawCsv, setShowRawCsv] = useState(false);

  const generateCsv = () => {
    const headers = ['Name', 'Phone Number', 'Email', 'Channel', 'Stage', 'Created Date'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone_number || c.platform_id || ''}"`,
      `"${c.email || ''}"`,
      `"${c.preferred_channel || 'WHATSAPP'}"`,
      `"${c.stage || 'NEW'}"`,
      `"${c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const generatePdfHtml = () => {
    const today = new Date().toLocaleDateString();
    const rowsHtml = contacts
      .map(
        (c) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.name || 'Unnamed'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.phone_number || c.platform_id || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.email || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.preferred_channel || 'WHATSAPP'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
            ${c.stage || 'NEW'}
          </span>
        </td>
      </tr>
    `
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CRM Leads Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #1f2937; }
    .header { border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
    h1 { color: #065f46; margin: 0 0 6px 0; font-size: 24px; }
    .subtitle { color: #6b7280; font-size: 13px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #f3f4f6; text-align: left; padding: 10px; border-bottom: 2px solid #d1d5db; color: #374151; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CRM Leads Report</h1>
    <p class="subtitle">Generated on ${today} • Total Leads: ${contacts.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Phone</th>
        <th>Email</th>
        <th>Channel</th>
        <th>Stage</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;
  };

  const csvContent = generateCsv();

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const today = new Date().toISOString().split('T')[0];
      const isPdf = exportFormat === 'pdf';
      const filename = isPdf ? `CRM_Leads_${today}.html` : `CRM_Leads_${today}.csv`;
      const mimeType = isPdf ? 'text/html' : 'text/csv';
      const content = isPdf ? generatePdfHtml() : csvContent;

      const result = await downloadFile({
        filename,
        content,
        mimeType,
      });

      if (result.success) {
        Alert.alert(
          '✓ Download Complete',
          `CRM Leads ${isPdf ? 'PDF/HTML' : 'CSV'} (${contacts.length} leads) saved successfully on your device.`
        );
      } else if (result.permissionDenied) {
        Alert.alert(
          'Storage Access Denied',
          'File access permission was denied. Please allow file access to save the download.',
          [
            { text: 'Try Again', onPress: handleDownload },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Download Failed',
          result.message || 'Unable to save the file on this device.',
          [
            { text: 'Retry', onPress: handleDownload },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to save file.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    try {
      setSharing(true);
      const today = new Date().toISOString().split('T')[0];
      const isPdf = exportFormat === 'pdf';
      const filename = isPdf ? `CRM_Leads_${today}.html` : `CRM_Leads_${today}.csv`;
      const mimeType = isPdf ? 'text/html' : 'text/csv';
      const content = isPdf ? generatePdfHtml() : csvContent;

      const result = await shareFile({
        filename,
        content,
        mimeType,
        dialogTitle: `Share CRM Leads ${isPdf ? 'PDF' : 'CSV'}`,
      });

      if (!result.success && result.message) {
        Alert.alert('Share Failed', result.message);
      }
    } catch (err: any) {
      console.warn('Share error:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = () => {
    try {
      const RN = require('react-native');
      if (RN.Clipboard && typeof RN.Clipboard.setString === 'function') {
        RN.Clipboard.setString(csvContent);
      }
    } catch (_e) {}
    setCopied(true);
    Alert.alert('📋 Copied to Clipboard', `${contacts.length} CRM Leads CSV copied to clipboard! You can paste it in Excel or Sheets.`);
    setTimeout(() => setCopied(false), 3000);
  };

  const previewContacts = contacts.slice(0, 3);

  return (
    <Modal visible={visible} title="Export CRM Leads" onClose={onClose}>
      <View style={styles.container}>
        {/* Format Selector Bar */}
        <View style={styles.formatSelector}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.formatChip,
              exportFormat === 'csv' && { backgroundColor: '#10B981', borderColor: '#10B981' },
              exportFormat !== 'csv' && { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setExportFormat('csv')}
          >
            <FileSpreadsheet size={14} color={exportFormat === 'csv' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.formatChipText, { color: exportFormat === 'csv' ? '#FFFFFF' : colors.textSecondary }]}>
              Excel CSV (.csv)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.formatChip,
              exportFormat === 'pdf' && { backgroundColor: '#10B981', borderColor: '#10B981' },
              exportFormat !== 'pdf' && { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setExportFormat('pdf')}
          >
            <FileText size={14} color={exportFormat === 'pdf' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.formatChipText, { color: exportFormat === 'pdf' ? '#FFFFFF' : colors.textSecondary }]}>
              PDF / HTML (.pdf)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banner Summary */}
        <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Download size={20} color="#10B981" />
          </View>
          <View style={styles.summaryInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                {contacts.length} Leads Ready
              </Text>
              <Badge label={exportFormat === 'pdf' ? 'PDF File' : 'CSV File'} variant="success" />
            </View>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>
              Standard Export (Name, Phone, Email, Stage, Channel)
            </Text>
          </View>
        </View>

        {/* Structured Lead Sample Cards */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Export Sample Preview:</Text>

        <View style={styles.sampleList}>
          {previewContacts.map((item, idx) => (
            <View key={idx} style={[styles.sampleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Avatar name={item.name || 'Lead'} size="sm" />
              <View style={styles.sampleInfo}>
                <Text style={[styles.sampleName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.name || 'Unnamed Customer'}
                </Text>
                <Text style={[styles.sampleSub, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.phone_number || item.email || item.platform_id || 'No contact info'}
                </Text>
              </View>
              <Badge label={item.stage || 'NEW'} variant="info" />
            </View>
          ))}
        </View>

        {/* Collapsible Raw CSV View */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.toggleRawBtn}
          onPress={() => setShowRawCsv(!showRawCsv)}
        >
          <FileSpreadsheet size={14} color={colors.primary} />
          <Text style={[styles.toggleRawText, { color: colors.primary }]}>
            {showRawCsv ? 'Hide Raw CSV Code' : 'View Raw CSV Code'}
          </Text>
          {showRawCsv ? <ChevronUp size={14} color={colors.primary} /> : <ChevronDown size={14} color={colors.primary} />}
        </TouchableOpacity>

        {showRawCsv ? (
          <ScrollView
            style={[
              styles.rawCsvBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            nestedScrollEnabled
          >
            <Text style={[styles.rawCsvText, { color: colors.textSecondary }]}>{csvContent}</Text>
          </ScrollView>
        ) : null}

        {/* Action Buttons: 1. Download, 2. Share File Attachment, 3. Copy */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={downloading}
            style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
            onPress={handleDownload}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Download size={16} color="#FFFFFF" />
            )}
            <Text style={styles.downloadBtnText}>
              {downloading ? 'Downloading...' : `Download ${exportFormat.toUpperCase()}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={sharing}
            style={[styles.secondaryActionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleShare}
          >
            {sharing ? <ActivityIndicator size="small" color={colors.textPrimary} /> : <Share2 size={16} color={colors.textPrimary} />}
            <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Share File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.secondaryActionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleCopy}
          >
            {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textPrimary} />}
            <Text style={[styles.secondaryActionText, { color: copied ? '#10B981' : colors.textPrimary }]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  container: {
    gap: 10,
    maxHeight: 480,
  },
  formatSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formatChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  formatChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 11,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sampleList: {
    gap: 6,
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  sampleInfo: {
    flex: 1,
    gap: 1,
  },
  sampleName: {
    fontSize: 13,
    fontWeight: '600',
  },
  sampleSub: {
    fontSize: 11,
  },
  toggleRawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  toggleRawText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rawCsvBox: {
    maxHeight: 110,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  rawCsvText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Platform',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
