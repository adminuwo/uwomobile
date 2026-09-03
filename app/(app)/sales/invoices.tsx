import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { invoicesApi } from '../../../src/api/invoices';
import { Receipt } from 'lucide-react-native';

export default function InvoicesScreen() {
  const { colors } = useTheme();

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getInvoices
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

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen options={{ title: 'GST Invoices', headerShown: true }} />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load invoices.</Text>
        </View>
      ) : invoices?.length === 0 ? (
        <View style={styles.emptyState}>
          <Receipt size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Invoices Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            GST Invoices created in the UwoConnect web dashboard will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.invoice_number}</Text>
                  <Text variant="body" style={{ marginTop: 4 }}>
                    {item.customer_name}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    Due: {new Date(item.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.rightContent}>
                  <Text variant="h3" color={colors.primary} weight="bold">
                    {item.currency} {item.total_amount}
                  </Text>
                  <Badge 
                    label={item.status} 
                    variant={getStatusColor(item.status) as any} 
                    style={{ marginTop: 8 }}
                  />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }
});
