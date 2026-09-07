import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { useTheme } from '../../theme';
import { templatesApi, WhatsAppTemplate } from '../../api/templates';
import { X, Send, Search, FileText } from 'lucide-react-native';

interface WhatsAppTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSendTemplate: (templateName: string, variables: Record<string, string>) => void;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  visible,
  onClose,
  onSendTemplate,
}) => {
  const { colors, spacing } = useTheme();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      fetchTemplates();
    }
  }, [visible]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesApi.getTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (tmpl: WhatsAppTemplate) => {
    setSelectedTemplate(tmpl);
    // Extract variables if any
    const vars: Record<string, string> = {};
    if (tmpl.variables) {
      tmpl.variables.forEach((v, idx) => {
        vars[`var_${idx + 1}`] = '';
      });
    }
    setVariables(vars);
  };

  const handleSend = () => {
    if (!selectedTemplate) return;
    onSendTemplate(selectedTemplate.name, variables);
    onClose();
    setSelectedTemplate(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <FileText size={20} color={colors.primary} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                WhatsApp Meta Templates
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {selectedTemplate ? (
            /* Variable Input & Confirmation Form */
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setSelectedTemplate(null)}
                style={styles.backLink}
              >
                <Text variant="caption" color={colors.primary} weight="bold">
                  ← Back to templates list
                </Text>
              </TouchableOpacity>

              <View style={[styles.selectedCard, { backgroundColor: `${colors.primary}0F` }]}>
                <View style={styles.cardHeader}>
                  <Text variant="h3" weight="bold" color={colors.primary}>
                    {selectedTemplate.name}
                  </Text>
                  <Badge label={selectedTemplate.status} variant="success" />
                </View>
                <Text variant="caption" color={colors.textMuted} style={styles.categoryText}>
                  Category: {selectedTemplate.category} ({selectedTemplate.language || 'en'})
                </Text>

                {/* Preview text */}
                {selectedTemplate.components?.map((c, idx) => (
                  <Text key={idx} variant="body" color={colors.textPrimary} style={styles.bodyText}>
                    {c.text}
                  </Text>
                ))}
              </View>

              {/* Variable Inputs */}
              {Object.keys(variables).length > 0 && (
                <View style={styles.variablesSection}>
                  <Text variant="label" color={colors.textPrimary} weight="bold" style={styles.sectionTitle}>
                    TEMPLATE PLACEHOLDERS / VARIABLES
                  </Text>
                  {Object.keys(variables).map((varKey, idx) => (
                    <View key={varKey} style={styles.inputGroup}>
                      <Text variant="caption" color={colors.textMuted} style={styles.inputLabel}>
                        Placeholder {`{{${idx + 1}}}`}
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: colors.surface,
                            color: colors.textPrimary,
                            borderColor: colors.border,
                          },
                        ]}
                        placeholder={`Enter value for {{${idx + 1}}}`}
                        placeholderTextColor={colors.textMuted}
                        value={variables[varKey]}
                        onChangeText={(txt) => setVariables((prev) => ({ ...prev, [varKey]: txt }))}
                      />
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                onPress={handleSend}
              >
                <Send size={18} color="#FFF" />
                <Text variant="body" weight="bold" color="#FFF">
                  Send Template Message
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Template Search & Selection List */
            <View style={styles.content}>
              <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder="Search approved Meta templates..."
                  placeholderTextColor={colors.textMuted}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : filtered.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filtered.map((item) => (
                    <TouchableOpacity
                      key={item.id || item.name}
                      style={[styles.templateItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.itemHeader}>
                        <Text variant="body" weight="bold" color={colors.textPrimary}>
                          {item.name}
                        </Text>
                        <Badge label={item.category} variant="info" />
                      </View>
                      <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
                        {item.components?.find((c) => c.type === 'BODY')?.text || 'Template message'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyBox}>
                  <Text variant="caption" color={colors.textMuted}>
                    No approved WhatsApp templates found.
                  </Text>
                </View>
              )}
            </View>
          )}
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
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  templateItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  backLink: {
    marginBottom: 12,
  },
  selectedCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    marginBottom: 8,
  },
  bodyText: {
    lineHeight: 20,
  },
  variablesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 11,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 24,
  },
});
