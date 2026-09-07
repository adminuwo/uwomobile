import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { useTheme } from '../../theme';
import { salesDocumentsApi, DocumentType, SalesDocumentItem } from '../../api/salesDocuments';
import { X, Plus, Trash2, FileText, Share2, Calculator } from 'lucide-react-native';

interface SalesDocumentModalProps {
  visible: boolean;
  documentType: DocumentType;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesDocumentModal: React.FC<SalesDocumentModalProps> = ({
  visible,
  documentType,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<SalesDocumentItem[]>([
    { description: 'Service / Product Item 1', quantity: 1, unit_price: 1000, tax_rate: 18 },
  ]);
  const [notes, setNotes] = useState('Payment due within 15 days.');
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0, tax_rate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, key: keyof SalesDocumentItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const totalTax = items.reduce((acc, item) => acc + (item.quantity * item.unit_price * ((item.tax_rate || 0) / 100)), 0);
  const totalAmount = subtotal + totalTax;

  const handleCreateDocument = async () => {
    if (!customerName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const doc = await salesDocumentsApi.createDocument({
        document_type: documentType,
        customer_name: customerName.trim(),
        items,
        subtotal,
        total_tax: totalTax,
        total_amount: totalAmount,
        notes: notes.trim(),
        status: 'SENT',
      });

      onSuccess();
      onClose();
      Alert.alert(
        `${documentType} Generated!`,
        `${documentType} #${doc.document_number || '1001'} created successfully for ₹${totalAmount.toLocaleString('en-IN')}`,
        [
          {
            text: 'Share PDF Link',
            onPress: () =>
              Share.share({
                message: `View your ${documentType} from Unified Web Options: https://uwoconnect.aisa24.com/public/${documentType.toLowerCase()}/${doc.id}`,
              }),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || `Failed to create ${documentType}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <FileText size={20} color={colors.primary} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                New {documentType}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Input
              label="Customer / Company Name"
              placeholder="e.g. Acme Corporation"
              value={customerName}
              onChangeText={setCustomerName}
            />

            {/* Line Items Section */}
            <View style={styles.itemsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text variant="label" color={colors.textPrimary} weight="bold">
                  LINE ITEMS & PRICING
                </Text>
                <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                  <Plus size={14} color={colors.primary} />
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Add Item
                  </Text>
                </TouchableOpacity>
              </View>

              {items.map((item, idx) => (
                <View key={idx} style={[styles.itemBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <View style={styles.itemHeader}>
                    <Text variant="caption" weight="bold" color={colors.textMuted}>
                      Item #{idx + 1}
                    </Text>
                    {items.length > 1 && (
                      <TouchableOpacity onPress={() => removeItem(idx)}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Input
                    label="Description"
                    placeholder="e.g. WhatsApp Automation Setup"
                    value={item.description}
                    onChangeText={(txt) => updateItem(idx, 'description', txt)}
                  />

                  <View style={styles.rowTwo}>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Qty"
                        keyboardType="numeric"
                        value={String(item.quantity)}
                        onChangeText={(txt) => updateItem(idx, 'quantity', parseInt(txt) || 1)}
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                      <Input
                        label="Unit Price (₹)"
                        keyboardType="numeric"
                        value={String(item.unit_price)}
                        onChangeText={(txt) => updateItem(idx, 'unit_price', parseFloat(txt) || 0)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="GST %"
                        keyboardType="numeric"
                        value={String(item.tax_rate || 18)}
                        onChangeText={(txt) => updateItem(idx, 'tax_rate', parseFloat(txt) || 0)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Total Calculation Card */}
            <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}0D` }]}>
              <View style={styles.summaryRow}>
                <Text variant="body" color={colors.textMuted}>Subtotal:</Text>
                <Text variant="body" weight="bold" color={colors.textPrimary}>₹{subtotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="body" color={colors.textMuted}>Total GST/Tax:</Text>
                <Text variant="body" weight="bold" color={colors.textPrimary}>₹{totalTax.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text variant="h3" weight="bold" color={colors.primary}>Total Amount:</Text>
                <Text variant="h2" weight="bold" color={colors.primary}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <Input
              label="Notes & Terms"
              placeholder="Enter terms & payment conditions..."
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            <Button
              title={`Issue & Generate ${documentType}`}
              loading={submitting}
              onPress={handleCreateDocument}
              style={{ marginTop: 12, marginBottom: 24 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 14,
  },
  itemsSection: {
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
});
