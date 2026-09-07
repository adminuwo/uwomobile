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
} from 'react-native';
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
import { templatesApi, WhatsAppTemplate } from '../../src/api/templates';
import { Megaphone, Plus, Send, CheckCircle2, Clock, XCircle, AlertCircle, Share2 } from 'lucide-react-native';

export interface Campaign {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'EMAIL';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  scheduled_at?: string;
  created_at: string;
}

export default function BroadcastsScreen() {
  const { colors, spacing } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // New Campaign Form
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);

  const fetchCampaigns = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get<any>('/api/campaigns/');
      const rawList = Array.isArray(res) ? res : res?.results || [];
      setCampaigns(rawList);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    templatesApi.getTemplates().then(setTemplates);
  }, [fetchCampaigns]);

  const handleCreateCampaign = async () => {
    if (!name.trim() || sending) return;

    try {
      setSending(true);
      await apiClient.post('/api/campaigns/', {
        name: name.trim(),
        channel,
        template_name: selectedTemplate || undefined,
        status: 'SCHEDULED',
      });

      setCreateModalVisible(false);
      setName('');
      setSelectedTemplate('');
      fetchCampaigns(true);
    } catch (err) {
      console.warn('Failed to launch campaign:', err);
    } finally {
      setSending(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge label="COMPLETED" variant="success" />;
      case 'SENDING':
        return <Badge label="SENDING" variant="info" />;
      case 'SCHEDULED':
        return <Badge label="SCHEDULED" variant="warning" />;
      default:
        return <Badge label={status} variant="neutral" />;
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Broadcasts & Campaigns"
        rightElement={
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Broadcast
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchCampaigns(true)} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Megaphone size={40} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                No Mass Broadcasts Found
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center" style={{ marginTop: 4 }}>
                Launch WhatsApp & Email marketing broadcasts to engage all customer leads instantly.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.campaignCard}>
            <View style={styles.cardHeader}>
              <View style={styles.channelRow}>
                <Share2 size={16} color={colors.primary} />
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  {item.name}
                </Text>
              </View>
              {renderStatusBadge(item.status)}
            </View>

            {/* Campaign Metrics */}
            <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
              <View style={styles.statBox}>
                <Text variant="caption" color={colors.textMuted}>
                  Recipients
                </Text>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  {item.total_recipients || 0}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text variant="caption" color={colors.textMuted}>
                  Sent
                </Text>
                <Text variant="body" weight="bold" color={colors.primary}>
                  {item.sent_count || 0}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text variant="caption" color={colors.textMuted}>
                  Delivered
                </Text>
                <Text variant="body" weight="bold" color={colors.info}>
                  {item.delivered_count || 0}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text variant="caption" color={colors.textMuted}>
                  Read
                </Text>
                <Text variant="body" weight="bold" color={colors.success}>
                  {item.read_count || 0}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Create Broadcast Modal */}
      <Modal
        visible={createModalVisible}
        title="Create New Mass Broadcast"
        onClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <Input
            label="Campaign Name"
            placeholder="e.g. Festival Special Offer Broadcast"
            value={name}
            onChangeText={setName}
          />

          <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 4 }}>
            Broadcast Channel
          </Text>
          <View style={styles.channelPicker}>
            <TouchableOpacity
              style={[
                styles.channelOption,
                channel === 'WHATSAPP' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setChannel('WHATSAPP')}
            >
              <Text variant="caption" weight="bold" color={channel === 'WHATSAPP' ? '#FFF' : colors.textPrimary}>
                WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.channelOption,
                channel === 'EMAIL' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setChannel('EMAIL')}
            >
              <Text variant="caption" weight="bold" color={channel === 'EMAIL' ? '#FFF' : colors.textPrimary}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {channel === 'WHATSAPP' && templates.length > 0 && (
            <View>
              <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 6 }}>
                Select Approved Meta Template
              </Text>
              <ScrollView style={styles.templateList} nestedScrollEnabled>
                {templates.map((t) => (
                  <TouchableOpacity
                    key={t.id || t.name}
                    style={[
                      styles.templateOption,
                      selectedTemplate === t.name && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
                    ]}
                    onPress={() => setSelectedTemplate(t.name)}
                  >
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      {t.name}
                    </Text>
                    <Badge label={t.category} variant="info" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Button
            title="Launch Broadcast Campaign"
            loading={sending}
            onPress={handleCreateCampaign}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  createBtn: {
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
  campaignCard: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  modalBody: {
    gap: 12,
  },
  channelPicker: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  channelOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  templateList: {
    maxHeight: 140,
    marginBottom: 10,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6,
  },
});
