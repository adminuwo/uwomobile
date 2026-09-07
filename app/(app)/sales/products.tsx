import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { productsApi, Product } from '../../../src/api/products';
import { AddProductModal } from '../../../src/components/sales/AddProductModal';
import { PackageOpen, Plus, Edit2 } from 'lucide-react-native';

export default function ProductsScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts()
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Products & Services', 
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenAdd}
            >
              <Plus size={16} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                Add Product
              </Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load products.</Text>
        </View>
      ) : products?.results?.length === 0 ? (
        <View style={styles.emptyState}>
          <PackageOpen size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Products Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Click 'Add Product' above to catalog your offerings.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products?.results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.productImg} />
                )}
                <View style={styles.content}>
                  <Text variant="h3" weight="bold">{item.name}</Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
                    {item.description || 'No description provided'}
                  </Text>
                  <Text variant="h2" color={colors.primary} style={{ marginTop: 8 }}>
                    {item.currency || '₹'} {typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : item.price}
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
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                    <Edit2 size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <AddProductModal
        visible={modalVisible}
        productToEdit={editingProduct}
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
    alignItems: 'center',
  },
  productImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  editBtn: {
    marginTop: 10,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }
});
