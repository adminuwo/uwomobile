import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { productsApi } from '../../../src/api/products';
import { PackageOpen } from 'lucide-react-native';

export default function ProductsScreen() {
  const { colors } = useTheme();

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts
  });

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen options={{ title: 'Products & Services', headerShown: true }} />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load products.</Text>
        </View>
      ) : products?.length === 0 ? (
        <View style={styles.emptyState}>
          <PackageOpen size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Products Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Products created in the UwoConnect web dashboard will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.name}</Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>
                  <Text variant="h2" color={colors.primary} style={{ marginTop: 8 }}>
                    {item.currency} {item.price}
                  </Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Badge 
                    label={item.status} 
                    variant={item.status === 'ACTIVE' ? 'success' : 'neutral'} 
                  />
                  {item.stock !== undefined && (
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                      Stock: {item.stock}
                    </Text>
                  )}
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
  badgeContainer: {
    alignItems: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }
});
