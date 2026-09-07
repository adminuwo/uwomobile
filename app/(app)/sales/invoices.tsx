import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { salesDocumentsApi } from '../../../src/api/salesDocuments';
import { SalesDocumentModal } from '../../../src/components/sales/SalesDocumentModal';
import { Receipt, Plus, Share2 } from 'lucide-react-native';

export default function InvoicesScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => salesDocumentsApi.getDocuments({ document_type: 'INVOICE' })
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'SENT': return 'info';
      case 'CANCELLED': return 'default';
      default: return 'warning'; // DRAFT
    }
  };

  const handleShare = (id: string, num: string) => {
    Share.share({
      message: `View Invoice #${num} from Unified Web Options: https://uwoconnect.aisa24.com/public/invoice/${id}`,
    });
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'GST Invoices',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                New Invoice
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load invoices.</Text>
        </View>
      ) : invoices?.results?.length === 0 ? (
        <View style={styles.emptyState}>
          <Receipt size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Invoices Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Click 'New Invoice' above to generate and issue your first GST Invoice.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices?.results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.document_number || 'INV-1001'}</Text>
                  <Text variant="body" style={{ marginTop: 4 }}>
                    {item.customer_name || item.customer}
                  </Text>
                  {item.due_date && (
                    <Text variant="caption" color={colors.textMuted}>
                      Due: {new Date(item.due_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={styles.rightContent}>
                  <Text variant="h3" color={colors.primary} weight="bold">
                    ₹{item.total_amount?.toLocaleString('en-IN') || 0}
                  </Text>
                  <TouchableOpacity style={styles.shareRow} onPress={() => handleShare(item.id, item.document_number)}>
                    <Badge 
                      label={item.status} 
                      variant={getStatusColor(item.status) as any} 
                    />
                    <Share2 size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <SalesDocumentModal
        visible={modalVisible}
        documentType="INVOICE"
        onClose={() => setModalVisible(false)}
        onSuccess={refetch}
      />
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
    marginRight: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }
});
