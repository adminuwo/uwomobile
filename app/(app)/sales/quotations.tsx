import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { SearchBar } from '../../../src/components/SearchBar';
import { useTheme } from '../../../src/theme';
import { salesDocumentsApi, SalesDocument } from '../../../src/api/salesDocuments';
import { SalesDocumentModal } from '../../../src/components/sales/SalesDocumentModal';
import { FileText, Plus, Share2, TrendingUp, CheckCircle, Clock } from 'lucide-react-native';

export default function QuotationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const { data: quotationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => salesDocumentsApi.getDocuments({ document_type: 'QUOTATION' })
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'SENT': return 'info';
      case 'VIEWED': return 'primary';
      default: return 'warning'; // DRAFT
    }
  };

  const handleShare = (id: string, num: string) => {
    Share.share({
      message: `View Quotation #${num} from Unified Web Options: https://uwoconnect.aisa24.com/public/quotation/${id}`,
    });
  };

  const allQuotations = quotationsData?.results || [];

  // Metrics
  const totalValue = useMemo(() => {
    return allQuotations.reduce((sum, p) => {
      const raw = p.total_amount ?? p.grand_total ?? 0;
      const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;
      return sum + num;
    }, 0);
  }, [allQuotations]);

  const acceptedCount = useMemo(() => {
    return allQuotations.filter((p) => (p.status || '').toUpperCase() === 'ACCEPTED').length;
  }, [allQuotations]);

  // Filtered list
  const filteredQuotations = useMemo(() => {
    return allQuotations.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        (p.document_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.customer_name || p.customer || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === 'ALL' || (p.status || '').toUpperCase() === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allQuotations, searchQuery, selectedStatus]);

  const statusFilters = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Quotation
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Summary Card */}
      <View style={styles.metricsContainer}>
        <Card style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <FileText size={13} color={colors.primary} />
                <Text variant="caption" color={colors.textMuted}>Total</Text>
              </View>
              <Text variant="h3" weight="bold" style={styles.metricVal}>
                {allQuotations.length}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={[styles.metricCol, { flex: 1.4 }]}>
              <View style={styles.metricHeader}>
                <TrendingUp size={13} color={colors.success} />
                <Text variant="caption" color={colors.textMuted}>Total Value</Text>
              </View>
              <Text 
                variant="h3" 
                weight="bold" 
                color={colors.success} 
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.metricVal}
              >
                {formatCurrency(totalValue)}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <CheckCircle size={13} color="#3B82F6" />
                <Text variant="caption" color={colors.textMuted}>Accepted</Text>
              </View>
              <Text variant="h3" weight="bold" color="#3B82F6" style={styles.metricVal}>
                {acceptedCount}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by quotation # or client..."
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => {
            const isActive = selectedStatus === item;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load quotations.</Text>
        </View>
      ) : filteredQuotations.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Quotations Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Click 'New Quotation' above to build and share a client proposal/quote.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuotations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }: { item: SalesDocument }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.document_number || 'QTN-1001'}</Text>
                  <Text variant="body" weight="medium" style={{ marginTop: 4 }}>
                    {item.customer_name || item.customer || 'Client'}
                  </Text>
                  <View style={styles.metaRow}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text variant="caption" color={colors.textMuted} style={{ marginLeft: 4 }}>
                      Created: {new Date(item.created_at || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.rightContent}>
                  <Text variant="h3" color={colors.primary} weight="bold">
                    ₹{Number(item.total_amount ?? item.grand_total ?? 0).toLocaleString('en-IN')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.shareRow} 
                    onPress={() => handleShare(item.id, item.document_number)}
                    activeOpacity={0.7}
                  >
                    <Badge 
                      label={item.status || 'DRAFT'} 
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  metricsCard: {
    padding: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    marginTop: 4,
    fontSize: 15,
  },
  metricDivider: {
    width: 1,
    height: 32,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  chipsContainer: {
    paddingVertical: 8,
  },
  chipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
