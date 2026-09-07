import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
// Document Picker helper
const getDocumentPicker = () => {
  try {
    return require('expo-document-picker');
  } catch (e) {
    return null;
  }
};
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Modal } from '../../src/components/Modal';
import { Input } from '../../src/components/Input';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import { Brain, Plus, Upload, Globe, FileText, Trash2, CheckCircle2 } from 'lucide-react-native';

export interface KnowledgeItem {
  id: string;
  title: string;
  doc_type: 'PDF' | 'DOCX' | 'URL' | 'TEXT';
  file_url?: string;
  website_url?: string;
  content_snippet?: string;
  chunks_count?: number;
  status: 'PROCESSING' | 'INDEXED' | 'FAILED';
  created_at: string;
}

export default function KnowledgeScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [tab, setTab] = useState<'FILE' | 'URL' | 'TEXT'>('FILE');

  // Form State
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textContent, setTextContent] = useState('');
  const [pickedFile, setPickedFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchKnowledge = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/knowledge/');
      const list = Array.isArray(res) ? res : res?.results || [];
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const handlePickDocument = async () => {
    try {
      const picker = getDocumentPicker();
      if (!picker) {
        Alert.alert('File Picker', 'Document selection demo mode. Enter Document Title below.');
        return;
      }
      const result = await picker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPickedFile(result.assets[0]);
        if (!title) setTitle(result.assets[0].name);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const handleCreateKnowledge = async () => {
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (tab === 'FILE' && pickedFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('doc_type', pickedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX');
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as any);

        await apiClient.post('/api/knowledge/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (tab === 'URL') {
        await apiClient.post('/api/knowledge/', {
          title: title.trim(),
          doc_type: 'URL',
          website_url: urlInput.trim(),
        });
      } else {
        await apiClient.post('/api/knowledge/', {
          title: title.trim(),
          doc_type: 'TEXT',
          content_snippet: textContent.trim(),
        });
      }

      setAddModalVisible(false);
      setTitle('');
      setUrlInput('');
      setTextContent('');
      setPickedFile(null);
      fetchKnowledge(true);
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to index knowledge item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/knowledge/${id}/`);
      fetchKnowledge(true);
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="AI Knowledge Base"
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              Train AI
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchKnowledge(true)} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Brain size={42} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Trained Knowledge Found
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center" style={{ marginTop: 4 }}>
                Upload PDFs, DOCX docs, website links or FAQs to train your AI Bot assistant.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.titleRow}>
                {item.doc_type === 'URL' ? (
                  <Globe size={18} color={colors.info} />
                ) : (
                  <FileText size={18} color={colors.primary} />
                )}
                <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ flex: 1 }}>
                  {item.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Badge label={item.doc_type} variant="info" />
              <Badge label={item.status || 'INDEXED'} variant="success" />
              {item.chunks_count ? (
                <Text variant="caption" color={colors.textMuted}>
                  {item.chunks_count} AI Chunks
                </Text>
              ) : null}
            </View>
          </Card>
        )}
      />

      {/* Add Knowledge Modal */}
      <Modal visible={addModalVisible} title="Train AI Assistant" onClose={() => setAddModalVisible(false)}>
        <View style={styles.modalBody}>
          {/* Tab Selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'FILE' && { backgroundColor: colors.primary }]}
              onPress={() => setTab('FILE')}
            >
              <Text variant="caption" weight="bold" color={tab === 'FILE' ? '#FFF' : colors.textPrimary}>
                PDF / Document
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, tab === 'URL' && { backgroundColor: colors.primary }]}
              onPress={() => setTab('URL')}
            >
              <Text variant="caption" weight="bold" color={tab === 'URL' ? '#FFF' : colors.textPrimary}>
                Website URL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, tab === 'TEXT' && { backgroundColor: colors.primary }]}
              onPress={() => setTab('TEXT')}
            >
              <Text variant="caption" weight="bold" color={tab === 'TEXT' ? '#FFF' : colors.textPrimary}>
                Text / FAQ
              </Text>
            </TouchableOpacity>
          </View>

          <Input label="Knowledge Title" placeholder="e.g. Product Catalog & Pricing 2026" value={title} onChangeText={setTitle} />

          {tab === 'FILE' && (
            <View style={styles.filePickerBox}>
              <TouchableOpacity style={styles.pickBtn} onPress={handlePickDocument}>
                <Upload size={20} color={colors.primary} />
                <Text variant="body" weight="bold" color={colors.primary}>
                  {pickedFile ? pickedFile.name : 'Select PDF or DOCX File'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'URL' && (
            <Input label="Website / Scraping URL" placeholder="https://example.com/faq" value={urlInput} onChangeText={setUrlInput} />
          )}

          {tab === 'TEXT' && (
            <Input
              label="Custom Instructions / Knowledge Snippet"
              placeholder="Enter product specs, refund policies, FAQs..."
              multiline
              numberOfLines={4}
              value={textContent}
              onChangeText={setTextContent}
            />
          )}

          <Button title="Index Knowledge for AI" loading={submitting} onPress={handleCreateKnowledge} />
        </View>
      </Modal>
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  itemCard: {
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalBody: {
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filePickerBox: {
    marginVertical: 4,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    borderRadius: 12,
  },
});
