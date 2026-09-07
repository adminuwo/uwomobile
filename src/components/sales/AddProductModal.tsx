import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from '../Text';
import { Button } from '../Button';
import { Input } from '../Input';
import { useTheme } from '../../theme';
import { productsApi, Product } from '../../api/products';
import { X, PackagePlus } from 'lucide-react-native';

interface AddProductModalProps {
  visible: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  productToEdit,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit ? String(productToEdit.price) : '');
  const [stock, setStock] = useState(productToEdit?.stock !== undefined ? String(productToEdit.stock) : '10');
  const [currency, setCurrency] = useState(productToEdit?.currency || 'INR');
  const [imageUrl, setImageUrl] = useState(productToEdit?.image_url || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !price || submitting) return;

    setSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        currency,
        image_url: imageUrl.trim() || undefined,
        status: 'ACTIVE',
      };

      if (productToEdit) {
        await productsApi.updateProduct(productToEdit.id, payload);
        Alert.alert('Success', 'Product updated successfully.');
      } else {
        await productsApi.createProduct(payload);
        Alert.alert('Success', 'Product created successfully.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product.');
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
              <PackagePlus size={20} color={colors.primary} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Input
              label="Product / Service Name"
              placeholder="e.g. Premium Automation Suite"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Description"
              placeholder="Brief details about features/deliverables..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.rowTwo}>
              <View style={{ flex: 1.5 }}>
                <Input
                  label="Price (INR / USD)"
                  keyboardType="numeric"
                  placeholder="e.g. 4999"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Currency"
                  placeholder="INR"
                  value={currency}
                  onChangeText={setCurrency}
                />
              </View>
            </View>

            <Input
              label="Available Stock"
              keyboardType="numeric"
              placeholder="10"
              value={stock}
              onChangeText={setStock}
            />

            <Input
              label="Image URL (Optional)"
              placeholder="https://example.com/product.png"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <Button
              title={productToEdit ? 'Save Changes' : 'Create Product'}
              loading={submitting}
              onPress={handleSave}
              style={{ marginTop: 16, marginBottom: 24 }}
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
    height: '75%',
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
  rowTwo: {
    flexDirection: 'row',
    gap: 8,
  },
});
