import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { quotationsApi } from '../../../src/api/quotations';
import { FileText } from 'lucide-react-native';

export default function QuotationsScreen() {
  const { colors } = useTheme();

  const { data: quotations, isLoading, error, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: quotationsApi.getQuotations
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'SENT': return 'info';
      default: return 'default';
    }
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen options={{ title: 'Quotations', headerShown: true }} />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load quotations.</Text>
        </View>
      ) : quotations?.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Quotations Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Quotations created in the UwoConnect web dashboard will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={quotations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.title}</Text>
                  <Text variant="body" style={{ marginTop: 4 }}>
                    {item.customer_name}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    Created: {new Date(item.created_at).toLocaleDateString()}
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
