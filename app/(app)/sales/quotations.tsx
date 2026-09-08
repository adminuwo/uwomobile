import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { salesDocumentsApi } from '../../../src/api/salesDocuments';
import { SalesDocumentModal } from '../../../src/components/sales/SalesDocumentModal';
import { FileText, Plus, Share2 } from 'lucide-react-native';

export default function QuotationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: quotations, isLoading, error, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => salesDocumentsApi.getDocuments({ document_type: 'QUOTATION' })
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'SENT': return 'info';
      default: return 'default';
    }
  };

  const handleShare = (id: string, num: string) => {
    Share.share({
      message: `View Quotation #${num} from Unified Web Options: https://uwoconnect.aisa24.com/public/quotation/${id}`,
    });
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Quotations"
        showMenu={true}
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Quotation
            </Text>
          </TouchableOpacity>
        }
      />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load quotations.</Text>
        </View>
      ) : quotations?.results?.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Quotations Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Click 'New Quotation' above to build and share a client proposal/quote.
          </Text>
        </View>
      ) : (
        <FlatList
          data={quotations?.results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.document_number || 'QTN-1001'}</Text>
                  <Text variant="body" style={{ marginTop: 4 }}>
                    {item.customer_name || item.customer}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    Created: {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </Text>
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
        documentType="QUOTATION"
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
