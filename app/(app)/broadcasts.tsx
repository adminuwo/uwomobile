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
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
import { Megaphone, Plus, CheckCircle2, Check, Send, Trash2 } from 'lucide-react-native';

export type BroadcastChannel =
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'GMAIL'
  | 'SMS'
  | 'TELEGRAM'
  | 'LINKEDIN';

export interface Campaign {
  id: string;
  name: string;
  channel: BroadcastChannel | string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  scheduled_at?: string;
  created_at: string;
}

// Channel Logos
const ChannelLogo: React.FC<{ channel: BroadcastChannel | string; size?: number }> = ({ channel, size = 24 }) => {
  const norm = (channel || '').toUpperCase();
  if (norm === 'WHATSAPP') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#25D366" />
        <Path
          d="M17.6 6.4C16.1 4.9 14.1 4.1 12 4.1C7.6 4.1 4.1 7.6 4.1 12C4.1 13.4 4.5 14.8 5.2 16L4.1 20L8.2 18.9C9.4 19.6 10.7 20 12 20C16.4 20 19.9 16.5 19.9 12.1C19.9 10 19.1 8 17.6 6.4ZM12 18.6C10.8 18.6 9.6 18.3 8.6 17.7L8.4 17.5L6 18.1L6.7 15.8L6.5 15.5C5.9 14.4 5.5 13.2 5.5 12C5.5 8.4 8.4 5.5 12 5.5C13.7 5.5 15.3 6.2 16.5 7.4C17.7 8.6 18.4 10.2 18.4 11.9C18.4 15.6 15.5 18.6 12 18.6ZM15.5 13.7C15.3 13.6 14.3 13.1 14.2 13.1C14 13 13.9 12.9 13.8 13.1C13.6 13.3 13.3 13.8 13.2 13.9C13.1 14 13 14 12.8 13.9C12.6 13.8 12 13.6 11.2 12.9C10.6 12.4 10.2 11.7 10.1 11.5C10 11.3 10.1 11.2 10.2 11.1C10.3 11 10.4 10.9 10.5 10.8C10.6 10.7 10.6 10.6 10.7 10.5C10.7 10.4 10.7 10.3 10.6 10.2C10.6 10.1 10.2 9.1 10 8.7C9.9 8.3 9.7 8.4 9.6 8.4H9.2C9 8.4 8.8 8.5 8.6 8.7C8.4 8.9 8 9.3 8 10.2C8 11.1 8.6 12 8.7 12.1C8.8 12.2 10 14.1 11.8 14.9C12.3 15.1 12.6 15.2 12.9 15.3C13.4 15.5 13.8 15.4 14.2 15.4C14.5 15.3 15.3 14.9 15.5 14.4C15.6 14 15.6 13.7 15.5 13.7Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }
  if (norm === 'INSTAGRAM') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="igBg" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFD600" />
            <Stop offset="25%" stopColor="#FF7A00" />
            <Stop offset="50%" stopColor="#FF0069" />
            <Stop offset="75%" stopColor="#D300C5" />
            <Stop offset="100%" stopColor="#7638FA" />
          </LinearGradient>
        </Defs>
        <Rect width="24" height="24" rx="6" fill="url(#igBg)" />
        <Rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        <Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        <Circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
      </Svg>
    );
  }
  if (norm === 'FACEBOOK') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#1877F2" />
        <Path
          d="M14.8 12.6L15.2 10H12.7V8.3C12.7 7.6 13 6.9 14.1 6.9H15.3V4.7C15.3 4.7 14.2 4.5 13.2 4.5C11.1 4.5 9.8 5.8 9.8 8V10H7.5V12.6H9.8V18.9C10.5 19 11.2 19 12 19C12.8 19 13.5 19 14.2 18.9V12.6H14.8Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }
  if (norm === 'GMAIL' || norm === 'EMAIL') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#EA4335" />
        <Path d="M5 19V9.4L1.5 6.8V17.5C1.5 18.3 2.2 19 3 19H5Z" fill="#4285F4" transform="scale(0.5) translate(4, 4)" />
        <Path d="M19 19V9.4L22.5 6.8V17.5C22.5 18.3 21.8 19 21 19H19Z" fill="#34A853" transform="scale(0.5) translate(4, 4)" />
        <Path d="M19 9.4V5L12 10.2L5 5V9.4L12 14.6L19 9.4Z" fill="#EA4335" transform="scale(0.5) translate(4, 4)" />
        <Path d="M5 5L1.5 6.8L5 9.4V5Z" fill="#C5221F" transform="scale(0.5) translate(4, 4)" />
        <Path d="M19 5L22.5 6.8L19 9.4V5Z" fill="#FBBC04" transform="scale(0.5) translate(4, 4)" />
        <Path
          d="M6 8.5L12 13L18 8.5M6 15.5H18C18.6 15.5 19 15.1 19 14.5V9.5C19 8.9 18.6 8.5 18 8.5H6C5.4 8.5 5 8.9 5 9.5V14.5C5 15.1 5.4 15.5 6 15.5Z"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (norm === 'SMS') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#3B82F6" />
        <Path
          d="M7 7.5C7 6.7 7.7 6 8.5 6H15.5C16.3 6 17 6.7 17 7.5V14.5C17 15.3 16.3 16 15.5 16H10L7 18.5V7.5Z"
          fill="#FFFFFF"
        />
        <Circle cx="9.5" cy="11" r="1" fill="#3B82F6" />
        <Circle cx="12" cy="11" r="1" fill="#3B82F6" />
        <Circle cx="14.5" cy="11" r="1" fill="#3B82F6" />
      </Svg>
    );
  }
  if (norm === 'TELEGRAM') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#229ED9" />
        <Path
          d="M6.2 11.8L16.8 7.3C17.3 7.1 17.8 7.5 17.6 8L15.8 16.5C15.7 17 15.1 17.2 14.7 16.9L11.8 14.7L10.4 16.1C10.2 16.3 9.9 16.2 9.8 15.9L9.1 13.5L6.4 12.7C5.9 12.5 5.9 11.9 6.2 11.8Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }
  if (norm === 'LINKEDIN') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect width="24" height="24" rx="5" fill="#0A66C2" />
        <Circle cx="8" cy="8" r="1.3" fill="#FFFFFF" />
        <Rect x="6.8" y="10.2" width="2.4" height="7.8" fill="#FFFFFF" rx="0.5" />
        <Path
          d="M10.8 10.2H13.1V11.3C13.4 10.7 14.2 10.1 15.3 10.1C17.3 10.1 17.8 11.4 17.8 13.3V18H15.4V13.8C15.4 12.8 15.1 12.1 14.1 12.1C13.3 12.1 12.8 12.7 12.8 13.6V18H10.8V10.2Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }
  return <Megaphone size={size} color="#64748B" />;
};

export const CHANNELS: { id: BroadcastChannel; name: string; subtitle: string; color: string; bgColor: string }[] = [
  { id: 'WHATSAPP', name: 'WhatsApp', subtitle: 'Official Meta Cloud API', color: '#00AB56', bgColor: '#E8F8F0' },
  { id: 'INSTAGRAM', name: 'Instagram Direct', subtitle: 'IG Business Inbound & DMs', color: '#E1306C', bgColor: '#FDEBF2' },
  { id: 'FACEBOOK', name: 'Facebook Messenger', subtitle: 'Page Inbox & Chats', color: '#0084FF', bgColor: '#EBF4FE' },
  { id: 'GMAIL', name: 'Email (Gmail & Outlook)', subtitle: 'Transactional & Mass Mail', color: '#EA4335', bgColor: '#FDF0ED' },
  { id: 'SMS', name: 'SMS Gateway', subtitle: 'Direct Cellular SMS', color: '#3B82F6', bgColor: '#EFF6FF' },
  { id: 'TELEGRAM', name: 'Telegram Bot', subtitle: 'Channels & Direct Broadcast', color: '#229ED9', bgColor: '#E9F5FB' },
  { id: 'LINKEDIN', name: 'LinkedIn InMail', subtitle: 'Lead Gen & B2B InMail', color: '#0A66C2', bgColor: '#EBF1F7' },
];

export default function BroadcastsScreen() {
  const { colors, spacing, mode } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // New Campaign Form
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<BroadcastChannel>('WHATSAPP');
  const [messageBody, setMessageBody] = useState('');
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
    templatesApi.getTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, [fetchCampaigns]);

  const handleCreateCampaign = async () => {
    if (!name.trim() || sending) return;

    try {
      setSending(true);
      await apiClient.post('/api/campaigns/', {
        name: name.trim(),
        channel,
        template_name: channel === 'WHATSAPP' ? (selectedTemplate || undefined) : undefined,
        message: messageBody.trim() || undefined,
        status: 'SCHEDULED',
      });

      setCreateModalVisible(false);
      setName('');
      setMessageBody('');
      setSelectedTemplate('');
      fetchCampaigns(true);
    } catch (err) {
      console.warn('Failed to launch campaign:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    Alert.alert(
      'Delete Broadcast',
      `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/campaigns/${campaign.id}/`);
              setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
            } catch (err: any) {
              console.warn('Failed to delete campaign:', err);
              // Optimistically update list
              setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
            }
          },
        },
      ]
    );
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

  const getChannelMeta = (chId: string) => {
    const found = CHANNELS.find((c) => c.id === chId || (chId === 'EMAIL' && c.id === 'GMAIL'));
    return found || { id: chId as any, name: chId, color: colors.primary, bgColor: `${colors.primary}15`, subtitle: '' };
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Broadcasts & Campaigns"
        showMenu={true}
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
                Launch WhatsApp, Instagram, Messenger, Email & SMS broadcasts to engage customer leads instantly.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const chMeta = getChannelMeta(item.channel);
          return (
            <Card style={styles.campaignCard}>
              <View style={styles.cardHeader}>
                <View style={styles.channelRow}>
                  <ChannelLogo channel={item.channel} size={22} />
                  <View style={{ flexShrink: 1 }}>
                    <Text variant="h3" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <View style={[styles.channelMiniPill, { backgroundColor: chMeta.bgColor }]}>
                        <Text variant="caption" weight="bold" color={chMeta.color} style={{ fontSize: 10 }}>
                          {chMeta.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.headerBadgeAndActions}>
                  {renderStatusBadge(item.status)}
                  <TouchableOpacity
                    style={[
                      styles.deleteBtn,
                      {
                        backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                        borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : '#FECACA',
                      },
                    ]}
                    onPress={() => handleDeleteCampaign(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
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
          );
        }}
      />

      {/* Create Broadcast Modal */}
      <Modal
        visible={createModalVisible}
        title="Create New Mass Broadcast"
        onClose={() => setCreateModalVisible(false)}
      >
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Input
            label="Campaign Name"
            placeholder="e.g. Festival Special Offer Broadcast"
            value={name}
            onChangeText={setName}
          />

          <View style={{ marginTop: 6, marginBottom: 4 }}>
            <Text variant="caption" weight="bold" color={colors.textPrimary}>
              Select Broadcast Channel ({CHANNELS.length} Available)
            </Text>
            <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
              Choose the network through which to dispatch this campaign
            </Text>
          </View>

          {/* 7 Channel Selector Grid */}
          <View style={styles.channelGrid}>
            {CHANNELS.map((ch) => {
              const isSelected = channel === ch.id;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    styles.channelGridCard,
                    { borderColor: isSelected ? ch.color : '#E2E8F0', backgroundColor: isSelected ? ch.bgColor : '#FFF' },
                  ]}
                  onPress={() => setChannel(ch.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ChannelLogo channel={ch.id} size={24} />
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="caption"
                        weight="bold"
                        color={isSelected ? ch.color : colors.textPrimary}
                        numberOfLines={1}
                      >
                        {ch.name}
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }} numberOfLines={1}>
                        {ch.subtitle}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedCheckBadge, { backgroundColor: ch.color }]}>
                      <Check size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {channel === 'WHATSAPP' && templates.length > 0 && (
            <View style={{ marginTop: 10 }}>
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

          {channel !== 'WHATSAPP' && (
            <View style={{ marginTop: 10 }}>
              <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 6 }}>
                Broadcast Message Content
              </Text>
              <TextInput
                placeholder="Enter campaign message text here..."
                placeholderTextColor={colors.textMuted}
                value={messageBody}
                onChangeText={setMessageBody}
                multiline
                numberOfLines={3}
                style={[
                  styles.messageInput,
                  { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface },
                ]}
              />
            </View>
          )}

          <View style={{ marginTop: 16, marginBottom: 10 }}>
            <Button
              title="Launch Broadcast Campaign"
              loading={sending}
              onPress={handleCreateCampaign}
            />
          </View>
        </ScrollView>
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
  headerBadgeAndActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  channelMiniPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
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
    maxHeight: 480,
  },
  channelGrid: {
    gap: 8,
    marginTop: 6,
  },
  channelGridCard: {
    position: 'relative',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 13,
  },
});

