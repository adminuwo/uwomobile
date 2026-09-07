import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useTheme } from '../../src/theme';
import { automationsApi, AutomationRule } from '../../src/api/automations';
import {
  Zap,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  X,
  Bot,
  Tag,
  CornerDownRight,
} from 'lucide-react-native';

export default function AutomationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'KEYWORD' | 'START_CHAT'>('KEYWORD');
  const [keywordsStr, setKeywordsStr] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [button1, setButton1] = useState('');
  const [button2, setButton2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: rules = [], isLoading, refetch } = useQuery({
    queryKey: ['automations'],
    queryFn: () => automationsApi.getAutomations(),
  });

  const handleOpenAdd = () => {
    setEditingRule(null);
    setName('');
    setTriggerType('KEYWORD');
    setKeywordsStr('');
    setResponseMsg('');
    setButton1('');
    setButton2('');
    setModalVisible(true);
  };

  const handleOpenEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setTriggerType(rule.trigger_type);
    setKeywordsStr(rule.keywords ? rule.keywords.join(', ') : '');
    setResponseMsg(rule.response);
    setButton1(rule.buttons?.[0] || '');
    setButton2(rule.buttons?.[1] || '');
    setModalVisible(true);
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await automationsApi.updateAutomation(rule.id, { enabled: !rule.enabled });
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle rule');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Rule', 'Are you sure you want to delete this auto-reply rule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await automationsApi.deleteAutomation(id);
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete rule');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !responseMsg.trim() || submitting) return;

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const buttons = [button1, button2].map((b) => b.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      const payload: Partial<AutomationRule> = {
        name: name.trim(),
        trigger_type: triggerType,
        keywords,
        response: responseMsg.trim(),
        buttons,
        channels: ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK'],
        enabled: true,
      };

      if (editingRule) {
        await automationsApi.updateAutomation(editingRule.id, payload);
        Alert.alert('Success', 'Auto-reply rule updated.');
      } else {
        await automationsApi.createAutomation(payload);
        Alert.alert('Success', 'Auto-reply rule created.');
      }

      refetch();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save auto-reply rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.response.toLowerCase().includes(search.toLowerCase()) ||
      (r.keywords && r.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Keyword Auto-Replies"
        showBack
        onBackPress={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]}
            onPress={handleOpenAdd}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Rule
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Input
          placeholder="Search keywords or reply text..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={18} color={colors.textMuted} />}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredRules.length === 0 ? (
        <View style={styles.emptyState}>
          <Zap size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>
            No Auto-Reply Rules Found
          </Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Click 'New Rule' to setup automated replies for incoming customer keywords like "PRICE", "LOCATION", "MENU".
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Bot size={20} color={colors.primary} />
                  <Text variant="h3" weight="bold" color={colors.textPrimary}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => handleToggle(item)}
                    trackColor={{ true: colors.primary }}
                  />
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleOpenEdit(item)}>
                    <Edit2 size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Keywords Tag List */}
              <View style={styles.keywordsContainer}>
                <Tag size={14} color={colors.primary} style={{ marginRight: 6 }} />
                {item.keywords && item.keywords.length > 0 ? (
                  item.keywords.map((kw, i) => (
                    <View key={i} style={[styles.tagPill, { backgroundColor: `${colors.primary}15` }]}>
                      <Text variant="caption" weight="bold" color={colors.primary}>
                        {kw}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Badge label={item.trigger_type} variant="info" />
                )}
              </View>

              {/* Auto Reply Output Preview */}
              <View style={[styles.responseBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CornerDownRight size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text variant="body" color={colors.textPrimary} numberOfLines={3} style={{ flex: 1 }}>
                  {item.response}
                </Text>
              </View>

              {item.buttons && item.buttons.length > 0 && (
                <View style={styles.buttonsRow}>
                  {item.buttons.map((btn, idx) => (
                    <View key={idx} style={[styles.buttonChip, { borderColor: colors.primary }]}>
                      <Text variant="caption" color={colors.primary} weight="bold">
                        {btn}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          )}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.titleRow}>
                <Zap size={20} color={colors.primary} />
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  {editingRule ? 'Edit Auto-Reply Rule' : 'New Auto-Reply Rule'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Input
                label="Rule Name"
                placeholder="e.g. Pricing Inquiries"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Trigger Keywords (comma separated)"
                placeholder="e.g. price, cost, rate, plans"
                value={keywordsStr}
                onChangeText={setKeywordsStr}
              />

              <Input
                label="Automated Reply Message"
                placeholder="Enter exact message to reply to the customer..."
                multiline
                numberOfLines={4}
                value={responseMsg}
                onChangeText={setResponseMsg}
              />

              <Text variant="label" color={colors.textMuted} style={{ marginTop: 8, marginBottom: 4 }}>
                OPTIONAL QUICK REPLY BUTTONS
              </Text>
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Button 1"
                    placeholder="View Plans"
                    value={button1}
                    onChangeText={setButton1}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Button 2"
                    placeholder="Talk to Agent"
                    value={button2}
                    onChangeText={setButton2}
                  />
                </View>
              </View>

              <Button
                title={editingRule ? 'Save Rule Changes' : 'Create Auto-Reply Rule'}
                loading={submitting}
                onPress={handleSave}
                style={{ marginTop: 16, marginBottom: 24 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  keywordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  responseBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  buttonChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    paddingTop: 14,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 8,
  },
});
