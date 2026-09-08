import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Modal } from '../Modal';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { useTheme } from '../../theme';
import { Contact } from '../../api/crm';
import { Download, Copy, Check, FileSpreadsheet, FileText, ChevronDown, ChevronUp, Share2, ExternalLink, Eye } from 'lucide-react-native';
import { downloadFile, shareFile, openFile } from '../../services/fileDownload';

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
  const [viewReportModal, setViewReportModal] = useState(false);

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
      let filename = isPdf ? `CRM_Leads_${today}.pdf` : `CRM_Leads_${today}.csv`;
      let mimeType = isPdf ? 'application/pdf' : 'text/csv';
      let fileUri: string | undefined;

      if (isPdf) {
        try {
          const Print = require('expo-print');
          if (Print && typeof Print.printToFileAsync === 'function') {
            const printRes = await Print.printToFileAsync({
              html: generatePdfHtml(),
            });
            fileUri = printRes.uri;
          }
        } catch (_err) {
          filename = `CRM_Leads_${today}.html`;
          mimeType = 'text/html';
        }
      }

      let result;
      if (fileUri) {
        result = await downloadFile({
          filename,
          url: fileUri,
          mimeType: 'application/pdf',
          dialogTitle: `Save CRM Leads PDF (${contacts.length} leads)`,
        });
      } else {
        const content = isPdf ? generatePdfHtml() : csvContent;
        result = await downloadFile({
          filename,
          content,
          mimeType,
          dialogTitle: `Save ${filename}`,
        });
      }

      if (result.success) {
        const activeUri = fileUri || result.uri;
        Alert.alert(
          '✓ Download Complete',
          `CRM Leads ${isPdf ? 'PDF' : 'CSV'} (${contacts.length} leads) is ready. Open now?`,
          [
            {
              text: 'Open File',
              onPress: async () => {
                setViewReportModal(true);
                if (activeUri) {
                  await openFile(activeUri, mimeType, filename);
                }
              },
            },
            { text: 'Done', style: 'cancel' },
          ]
        );
      } else if (result.permissionDenied) {
        Alert.alert(
          'Storage Permission Required',
          'Please grant storage folder permission so the file can be downloaded and saved on your device.',
          [
            { text: 'Grant Permission', onPress: handleDownload },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Download Failed', result.message || 'Unable to save file on this device.');
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
      let filename = isPdf ? `CRM_Leads_${today}.pdf` : `CRM_Leads_${today}.csv`;
      let mimeType = isPdf ? 'application/pdf' : 'text/csv';
      let fileUri: string | undefined;

      if (isPdf) {
        try {
          const Print = require('expo-print');
          if (Print && typeof Print.printToFileAsync === 'function') {
            const printRes = await Print.printToFileAsync({
              html: generatePdfHtml(),
            });
            fileUri = printRes.uri;
          }
        } catch (_err) {
          filename = `CRM_Leads_${today}.html`;
          mimeType = 'text/html';
        }
      }

      if (fileUri) {
        await shareFile({
          filename,
          url: fileUri,
          mimeType: 'application/pdf',
          dialogTitle: `Share CRM Leads PDF`,
        });
      } else {
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
    <>
      <Modal visible={visible} title="Export CRM Leads" onClose={onClose}>
        <View style={styles.modalWrapper}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
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

            {/* View Full Report Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.viewReportBtn, { backgroundColor: colors.surface, borderColor: '#10B981' }]}
              onPress={() => setViewReportModal(true)}
            >
              <Eye size={16} color="#10B981" />
              <Text style={[styles.viewReportBtnText, { color: '#10B981' }]}>
                Preview & Open Full Report ({contacts.length} Leads)
              </Text>
            </TouchableOpacity>

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
              <View
                style={[
                  styles.rawCsvBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.rawCsvText, { color: colors.textSecondary }]}>{csvContent}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Buttons Pinned at bottom of Modal */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
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
              <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Share</Text>
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

      {/* Full In-App Report Viewer Modal */}
      <Modal visible={viewReportModal} title="CRM Leads Full Report" onClose={() => setViewReportModal(false)}>
        <View style={styles.fullReportContainer}>
          <View style={[styles.reportHeaderBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.reportHeaderCount, { color: colors.textPrimary }]}>
              Total {contacts.length} Exported Leads
            </Text>
            <Badge label={exportFormat.toUpperCase()} variant="success" />
          </View>

          <ScrollView style={styles.fullReportScroll} nestedScrollEnabled>
            <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.colName, styles.tableHeaderText, { color: colors.textSecondary }]}>Name</Text>
              <Text style={[styles.colPhone, styles.tableHeaderText, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.colStage, styles.tableHeaderText, { color: colors.textSecondary }]}>Stage</Text>
            </View>

            {contacts.map((c, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: i % 2 === 0 ? colors.card : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.colName}>
                  <Text style={[styles.rowNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {c.name || 'Unnamed'}
                  </Text>
                  {c.email ? (
                    <Text style={[styles.rowSubText, { color: colors.textMuted }]} numberOfLines={1}>
                      {c.email}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.colPhone}>
                  <Text style={[styles.rowPhoneText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {c.phone_number || c.platform_id || '-'}
                  </Text>
                  <Text style={[styles.rowSubText, { color: '#10B981' }]}>
                    {c.preferred_channel || 'WhatsApp'}
                  </Text>
                </View>

                <View style={styles.colStage}>
                  <Badge label={c.stage || 'NEW'} variant="info" />
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooterActions}>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleDownload}
            >
              <Download size={16} color="#FFF" />
              <Text style={styles.downloadBtnText}>Save / Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setViewReportModal(false)}
            >
              <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  modalWrapper: {
    maxHeight: 520,
    flexShrink: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  container: {
    gap: 12,
    paddingBottom: 10,
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
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
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
  viewReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    marginVertical: 4,
  },
  viewReportBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fullReportContainer: {
    gap: 12,
    maxHeight: 520,
  },
  reportHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
  },
  reportHeaderCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  fullReportScroll: {
    maxHeight: 360,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  colName: {
    flex: 2,
    gap: 2,
  },
  colPhone: {
    flex: 2,
    gap: 2,
  },
  colStage: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rowNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowPhoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowSubText: {
    fontSize: 11,
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
});
