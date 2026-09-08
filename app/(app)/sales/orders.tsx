import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { SearchBar } from '../../../src/components/SearchBar';
import { useTheme } from '../../../src/theme';
import { ordersApi, Order } from '../../../src/api/orders';
import { ShoppingBag, DollarSign, CheckCircle2, Clock, AlertCircle, Tag } from 'lucide-react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const { data: rawOrders, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getOrders();
      if (Array.isArray(res)) return res;
      return res?.results || [];
    }
  });

  const ordersList: Order[] = Array.isArray(rawOrders) ? rawOrders : [];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'info';
    }
  };

  // Pipeline metrics
  const totalRevenue = useMemo(() => {
    return ordersList.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  }, [ordersList]);

  const paidCount = useMemo(() => {
    return ordersList.filter((o) => (o.status || '').toUpperCase() === 'PAID').length;
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchesSearch =
        !searchQuery ||
        (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.contact_name || o.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.contact_phone || '').includes(searchQuery);
      const matchesStatus =
        selectedStatus === 'ALL' || (o.status || '').toUpperCase() === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [ordersList, searchQuery, selectedStatus]);

  const statusFilters = ['ALL', 'PAID', 'PENDING', 'FAILED'];

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Orders & Sales" showMenu={true} />

      {/* Overview Stats */}
      <View style={styles.metricsContainer}>
        <Card style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <ShoppingBag size={14} color={colors.primary} />
                <Text variant="caption" color={colors.textMuted}>Total Orders</Text>
              </View>
              <Text variant="h3" weight="bold" style={styles.metricVal}>
                {ordersList.length}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <DollarSign size={14} color={colors.success} />
                <Text variant="caption" color={colors.textMuted}>Total Sales</Text>
              </View>
              <Text variant="h3" weight="bold" color={colors.success} style={styles.metricVal}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <CheckCircle2 size={14} color="#3B82F6" />
                <Text variant="caption" color={colors.textMuted}>Paid Orders</Text>
              </View>
              <Text variant="h3" weight="bold" color="#3B82F6" style={styles.metricVal}>
                {paidCount}
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
          placeholder="Search by order ID, customer or phone..."
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
          <Text color={colors.error}>Failed to load orders.</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Orders Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Orders generated from WhatsApp catalog carts and checkout flows will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }: { item: Order }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <View style={styles.orderIdRow}>
                    <Text variant="h3" weight="bold">#{String(item.id).substring(0, 8)}</Text>
                    <Badge label={item.status || 'PENDING'} variant={getStatusColor(item.status) as any} />
                  </View>

                  <Text variant="body" weight="medium" style={{ marginTop: 4 }}>
                    {item.contact_name || item.customer || 'Customer'}
                  </Text>
                  {item.contact_phone ? (
                    <Text variant="caption" color={colors.textMuted}>
                      {item.contact_phone}
                    </Text>
                  ) : null}

                  {/* Items list */}
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <View style={styles.itemsSummary}>
                      {item.items.map((it, idx) => (
                        <View key={idx} style={styles.itemBadge}>
                          <Tag size={10} color={colors.textMuted} />
                          <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                            {it.name || it.description || 'Item'} (x{it.quantity || 1})
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.metaRow}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text variant="caption" color={colors.textMuted} style={{ marginLeft: 4 }}>
                      {new Date(item.created_at || Date.now()).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightContent}>
                  <Text variant="h3" color={colors.success} weight="bold">
                    ₹{item.total_amount?.toLocaleString('en-IN') || 0}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsSummary: {
    marginTop: 8,
    gap: 4,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
});
