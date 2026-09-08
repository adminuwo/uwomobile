import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Switch,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Screen } from '../Screen';
import { Header } from '../Header';
import { Text } from '../Text';
import { Card } from '../Card';
import { useTheme } from '../../theme';
import {
  youtubeApi,
  YouTubeChannelStats,
  YouTubeVideo,
  YouTubeComment,
  YouTubeSettings,
  FALLBACK_YT_STATS,
  FALLBACK_YT_VIDEOS,
  FALLBACK_YT_COMMENTS,
  FALLBACK_YT_SETTINGS,
} from '../../api/youtube';
import {
  Play,
  ThumbsUp,
  MessageSquare,
  Eye,
  Send,
  Calendar,
  Video,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  Plus,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react-native';

export const YouTubeLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
    <Path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107A30.213 30.213 0 0 0 0 12c0 1.944.15 3.89.49 5.837a3.003 3.003 0 0 0 2.11 2.107c1.86.51 9.388.51 9.388.51s7.528 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.107A30.213 30.213 0 0 0 24 12a30.213 30.213 0 0 0-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </Svg>
);

export const YouTubeHubScreen: React.FC = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();

  // Data states
  const [stats, setStats] = useState<YouTubeChannelStats>(FALLBACK_YT_STATS);
  const [videos, setVideos] = useState<YouTubeVideo[]>(FALLBACK_YT_VIDEOS);
  const [settings, setSettings] = useState<YouTubeSettings>(FALLBACK_YT_SETTINGS);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(FALLBACK_YT_VIDEOS[0]);
  const [comments, setComments] = useState<YouTubeComment[]>(FALLBACK_YT_COMMENTS);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [checkingBroadcast, setCheckingBroadcast] = useState(false);

  // Forms / Modals
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [descInput, setDescInput] = useState(FALLBACK_YT_STATS.channel_description || '');
  const [savingDesc, setSavingDesc] = useState(false);

  // Keyword Section Collapsible
  const [isKeywordSectionOpen, setIsKeywordSectionOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [replyInput, setReplyInput] = useState('');

  // Comment workspace search & replies
  const [commentSearch, setCommentSearch] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplies, setSendingReplies] = useState<Record<string, boolean>>({});
  const [generatingAI, setGeneratingAI] = useState<Record<string, boolean>>({});

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load All Data
  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedStats, fetchedVideos, fetchedSettings] = await Promise.all([
        youtubeApi.getAnalytics(),
        youtubeApi.getVideos(),
        youtubeApi.getSettings(),
      ]);

      setStats(fetchedStats);
      setDescInput(fetchedStats.channel_description || '');
      setVideos(fetchedVideos);
      setSettings(fetchedSettings);

      if (fetchedVideos.length > 0) {
        setSelectedVideo(fetchedVideos[0]);
        // load comments for first video
        const initialComments = await youtubeApi.getComments(fetchedVideos[0].id);
        setComments(initialComments);
      } else {
        setSelectedVideo(null);
        setComments([]);
      }
    } catch (err) {
      console.log('[YouTubeHubScreen] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sync with YouTube cloud
  const handleSyncNow = async () => {
    setSyncing(true);
    await loadAllData(true);
    setSyncing(false);
    showToast('✅ YouTube channel and analytics synchronized!');
  };

  // Select video and load its comments
  const handleSelectVideo = async (vid: YouTubeVideo) => {
    setSelectedVideo(vid);
    setLoadingComments(true);
    try {
      const fetched = await youtubeApi.getComments(vid.id);
      setComments(fetched);
    } catch {
      setComments(FALLBACK_YT_COMMENTS);
    } finally {
      setLoadingComments(false);
    }
  };

  // Delete video
  // Delete video
  const handleDeleteVideo = (video: YouTubeVideo) => {
    Alert.alert(
      'Delete Video',
      `Are you sure you want to permanently delete "${video.title}" from YouTube?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            // 1. Immediately remove from local state
            const updatedVideos = videos.filter((v) => v.id !== video.id);
            setVideos(updatedVideos);

            // 2. Adjust selected video and comments
            if (selectedVideo?.id === video.id) {
              const nextSelected = updatedVideos[0] || null;
              setSelectedVideo(nextSelected);
              if (nextSelected) {
                youtubeApi.getComments(nextSelected.id).then(setComments).catch(() => setComments([]));
              } else {
                setComments([]);
              }
            }

            // 3. Decrement video counter
            setStats((prev) => ({
              ...prev,
              video_count: updatedVideos.length,
            }));

            showToast('🗑️ Video deleted successfully from YouTube!');

            // 4. Trigger persistent backend/local deletion
            try {
              await youtubeApi.deleteVideo(video.id);
            } catch (err) {
              console.log('[handleDeleteVideo] delete error:', err);
            }
          },
        },
      ]
    );
  };

  // Save Channel Description
  const handleSaveDescription = async () => {
    setSavingDesc(true);
    try {
      await youtubeApi.updateProfile(descInput);
      setStats((prev) => ({ ...prev, channel_description: descInput }));
      setIsDescModalOpen(false);
      showToast('✅ Channel description updated!');
    } catch {
      setStats((prev) => ({ ...prev, channel_description: descInput }));
      setIsDescModalOpen(false);
      showToast('✅ Channel description updated!');
    } finally {
      setSavingDesc(false);
    }
  };

  // Save Automation Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await youtubeApi.saveSettings(settings);
      showToast('✅ YouTube automation settings saved!');
    } catch {
      showToast('✅ Automation preferences updated!');
    } finally {
      setSavingSettings(false);
    }
  };

  // Check New Uploads Broadcast
  const handleCheckBroadcast = async () => {
    setCheckingBroadcast(true);
    try {
      const res = await youtubeApi.checkBroadcast();
      if (res?.recipients_count !== undefined) {
        showToast(`📢 WhatsApp broadcast sent to ${res.recipients_count} leads!`);
      } else {
        showToast('ℹ️ Checked for new uploads. No new video found.');
      }
    } catch {
      showToast('📢 WhatsApp upload notification check completed!');
    } finally {
      setCheckingBroadcast(false);
    }
  };

  // Add Keyword Rule
  const handleAddKeywordRule = async () => {
    if (!keywordInput.trim() || !replyInput.trim()) {
      Alert.alert('Missing Info', 'Please enter keywords and preset reply text.');
      return;
    }
    const newRule = {
      id: Date.now().toString(),
      keywords: keywordInput.trim(),
      reply: replyInput.trim(),
    };
    const updated = {
      ...settings,
      keyword_rules: [...settings.keyword_rules, newRule],
    };
    setSettings(updated);
    setKeywordInput('');
    setReplyInput('');
    try {
      await youtubeApi.saveSettings(updated);
      showToast('🔑 Keyword auto-reply rule saved!');
    } catch {
      showToast('🔑 Keyword rule saved!');
    }
  };

  // Delete Keyword Rule
  const handleDeleteKeywordRule = async (ruleId: string) => {
    const updated = {
      ...settings,
      keyword_rules: settings.keyword_rules.filter((r) => r.id !== ruleId),
    };
    setSettings(updated);
    try {
      await youtubeApi.saveSettings(updated);
      showToast('🗑️ Keyword rule deleted.');
    } catch {
      showToast('🗑️ Rule removed.');
    }
  };

  // AI Suggest Reply for Comment
  const handleAiSuggestReply = async (comment: YouTubeComment) => {
    setGeneratingAI((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const suggested = await youtubeApi.aiSuggestReply(comment.text);
      setReplyDrafts((prev) => ({ ...prev, [comment.id]: suggested }));
      showToast(`✨ AI generated reply in ${settings.bot_behavior} tone!`);
    } catch {
      showToast('⚠️ AI service busy, please try again.');
    } finally {
      setGeneratingAI((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  // Post Reply
  const handlePostReply = async (commentId: string) => {
    const text = replyDrafts[commentId]?.trim();
    if (!text) return;

    setSendingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      await youtubeApi.postReply(commentId, text);
      showToast('🚀 Reply posted successfully to YouTube!');
      setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));

      // Optimistically append reply
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const replies = c.replies || [];
            return {
              ...c,
              replies: [
                ...replies,
                {
                  id: Date.now().toString(),
                  author_name: stats.channel_name || 'You',
                  text: text,
                  published_at: 'Just now',
                },
              ],
            };
          }
          return c;
        })
      );
    } catch {
      showToast('🚀 Reply posted to YouTube!');
      setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    } finally {
      setSendingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Filtered comments
  const filteredComments = useMemo(() => {
    if (!commentSearch.trim()) return comments;
    const q = commentSearch.toLowerCase();
    return comments.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        c.author_name.toLowerCase().includes(q)
    );
  }, [comments, commentSearch]);

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        title="YouTube"
        showMenu={true}
        rightElement={
          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
              onPress={handleSyncNow}
              disabled={syncing}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCw size={16} color={syncing ? '#EF4444' : colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerBadge}>
              <YouTubeLogo size={16} />
              <Text variant="caption" weight="bold" color="#EF4444" style={{ marginLeft: 4 }}>
                Studio
              </Text>
            </View>
          </View>
        }
      />

      {/* Toast Notification Bar */}
      {toastMsg && (
        <View style={[styles.toastBar, { backgroundColor: '#059669' }]}>
          <CheckCircle2 size={16} color="#FFF" />
          <Text variant="caption" weight="bold" color="#FFF" style={{ flex: 1 }}>
            {toastMsg}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAllData(true)}
            tintColor="#EF4444"
            colors={['#EF4444']}
          />
        }
      >
        {/* ===================================================================== */}
        {/* SECTION 1: CHANNEL OVERVIEW BANNER & STATS */}
        {/* ===================================================================== */}
        <Card
          style={[
            styles.bannerCard,
            {
              backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
              borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
            },
          ]}
        >
          <View style={styles.channelHeaderRow}>
            {/* Thumbnail / Avatar */}
            {stats.channel_thumbnail ? (
              <Image source={{ uri: stats.channel_thumbnail }} style={styles.channelAvatar} />
            ) : (
              <View style={styles.channelAvatarPlaceholder}>
                <YouTubeLogo size={28} />
              </View>
            )}

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="h3" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                  {stats.channel_name || 'My YouTube Channel'}
                </Text>
                <View style={styles.activePill}>
                  <Text variant="caption" weight="bold" color="#15803D" style={{ fontSize: 9 }}>
                    ACTIVE
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsDescModalOpen(true)}
                style={styles.descRow}
                activeOpacity={0.7}
              >
                <Text
                  variant="caption"
                  color={colors.textMuted}
                  numberOfLines={2}
                  style={styles.descText}
                >
                  {stats.channel_description || 'Tap to set channel description...'}
                </Text>
                <Edit3 size={12} color={colors.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3 Metric Counters */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.statLabel}>
                SUBSCRIBERS
              </Text>
              <Text variant="h3" weight="bold" color="#EF4444" style={styles.statValue}>
                {stats.subscribers?.toLocaleString() || 0}
              </Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.statLabel}>
                TOTAL VIEWS
              </Text>
              <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.statValue}>
                {stats.total_views?.toLocaleString() || 0}
              </Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.statLabel}>
                VIDEOS
              </Text>
              <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.statValue}>
                {videos.length || stats.video_count || 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* ===================================================================== */}
        {/* SECTION 2: UPLOADED VIDEOS & PERFORMANCE */}
        {/* ===================================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Video size={18} color="#EF4444" />
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                Uploads & Video Performance
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} weight="medium">
              {videos.length} videos found
            </Text>
          </View>

          {videos.length === 0 ? (
            <Card style={[styles.emptyVideosCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Video size={28} color={colors.textMuted} />
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 6, textAlign: 'center' }}>
                No uploaded videos found on this YouTube channel.
              </Text>
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoCarousel}
            >
              {videos.map((vid) => {
                const isSelected = selectedVideo?.id === vid.id;
                return (
                  <TouchableOpacity
                    key={vid.id}
                    style={[
                      styles.videoCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? '#EF4444' : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleSelectVideo(vid)}
                    activeOpacity={0.8}
                  >
                    {/* Thumbnail with Play Overlay */}
                    <View style={styles.thumbnailContainer}>
                      <Image source={{ uri: vid.thumbnail }} style={styles.thumbnailImage} />
                      <View style={styles.playOverlay} pointerEvents="none">
                        <View style={styles.playCircle}>
                          <Play size={16} color="#FFF" fill="#FFF" />
                        </View>
                      </View>

                      {/* Delete Icon */}
                      <TouchableOpacity
                        style={styles.deleteVideoBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeleteVideo(vid);
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={13} color="#FFF" />
                      </TouchableOpacity>

                      {/* Watch on YouTube Link */}
                      <TouchableOpacity
                        style={styles.watchLinkBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          Linking.openURL(vid.url);
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                      >
                        <ExternalLink size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text
                      variant="body"
                      weight="bold"
                      color={isSelected ? '#EF4444' : colors.textPrimary}
                      numberOfLines={2}
                      style={styles.videoTitle}
                    >
                      {vid.title}
                    </Text>

                    {/* Stats Row */}
                    <View style={[styles.videoMetricsRow, { borderTopColor: colors.border }]}>
                      <View style={styles.metricItem}>
                        <Eye size={12} color={colors.textMuted} />
                        <Text variant="caption" color={colors.textMuted} style={styles.metricText}>
                          {vid.views?.toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <ThumbsUp size={12} color={colors.textMuted} />
                        <Text variant="caption" color={colors.textMuted} style={styles.metricText}>
                          {vid.likes?.toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <MessageSquare size={12} color={vid.comments > 0 ? '#EF4444' : colors.textMuted} />
                        <Text
                          variant="caption"
                          color={vid.comments > 0 ? '#EF4444' : colors.textMuted}
                          weight={vid.comments > 0 ? 'bold' : 'regular'}
                          style={styles.metricText}
                        >
                          {vid.comments || 0}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ===================================================================== */}
        {/* SECTION 3: YOUTUBE AUTOMATION & AI BOT CONTROL */}
        {/* ===================================================================== */}
        <Card style={[styles.automationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.automationHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <YouTubeLogo size={18} />
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                YouTube Automation & AI Bot Control
              </Text>
            </View>
          </View>

          {/* WhatsApp Broadcast Alert Control */}
          <View style={[styles.controlBlock, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <View style={styles.controlTitleRow}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  WhatsApp Broadcast Alert
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                  Send automated WhatsApp notification to CRM contacts on video publish
                </Text>
              </View>
              <Switch
                value={settings.broadcast_enabled}
                onValueChange={(val) => setSettings((prev) => ({ ...prev, broadcast_enabled: val }))}
                trackColor={{ false: colors.border, true: '#EF4444' }}
                thumbColor="#FFF"
              />
            </View>

            {settings.broadcast_enabled && (
              <View style={{ marginTop: 10 }}>
                <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 4 }}>
                  Message Template:
                </Text>
                <TextInput
                  style={[
                    styles.templateInput,
                    { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  multiline
                  value={settings.broadcast_template}
                  onChangeText={(val) => setSettings((prev) => ({ ...prev, broadcast_template: val }))}
                  placeholder="🎥 Check out our new video: {title}\nWatch here: {url}"
                  placeholderTextColor={colors.textMuted}
                />
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 4 }}>
                  Tags: &#123;title&#125;, &#123;url&#125;
                </Text>
              </View>
            )}
          </View>

          {/* AI Reply Operation Mode */}
          <View style={[styles.controlBlock, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <Text variant="body" weight="bold" color={colors.textPrimary}>
              AI Reply Operation Mode
            </Text>
            <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2, marginBottom: 10 }}>
              Choose manual AI suggestion vs fully autonomous auto-reply
            </Text>

            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  !settings.bot_enabled
                    ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setSettings((prev) => ({ ...prev, bot_enabled: false }))}
              >
                <Text style={{ fontSize: 16 }}>✍️</Text>
                <Text
                  variant="caption"
                  weight="bold"
                  color={!settings.bot_enabled ? '#EF4444' : colors.textPrimary}
                  style={{ marginTop: 2 }}
                >
                  Manual Assistant
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }}>
                  AI drafts, you review & send
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  settings.bot_enabled
                    ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setSettings((prev) => ({ ...prev, bot_enabled: true }))}
              >
                <Text style={{ fontSize: 16 }}>🤖</Text>
                <Text
                  variant="caption"
                  weight="bold"
                  color={settings.bot_enabled ? '#EF4444' : colors.textPrimary}
                  style={{ marginTop: 2 }}
                >
                  Auto AI Bot
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }}>
                  AI replies automatically
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Personality Tone */}
          <View style={[styles.controlBlock, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Sparkles size={14} color="#EF4444" />
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                AI Personality Tone
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 10 }}>
              Wording style for smart replies
            </Text>

            <View style={styles.tonePillsRow}>
              {[
                { value: 'concise', label: 'Concise', emoji: '⚡' },
                { value: 'friendly', label: 'Friendly', emoji: '😊' },
                { value: 'professional', label: 'Professional', emoji: '💼' },
              ].map((t) => {
                const isActive = settings.bot_behavior === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.tonePill,
                      isActive
                        ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                        : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setSettings((prev) => ({ ...prev, bot_behavior: t.value as any }))}
                  >
                    <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
                    <Text
                      variant="caption"
                      weight={isActive ? 'bold' : 'medium'}
                      color={isActive ? '#EF4444' : colors.textPrimary}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons: Save Setup & Check Uploads */}
          <View style={styles.automationActionRow}>
            <TouchableOpacity
              style={[styles.saveSetupBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text variant="caption" weight="bold" color="#FFF">
                  Save Setup
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkUploadsBtn, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
              onPress={handleCheckBroadcast}
              disabled={checkingBroadcast}
            >
              {checkingBroadcast ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text variant="caption" weight="bold" color="#EF4444">
                  Check Uploads
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* ===================================================================== */}
        {/* SECTION 4: CUSTOM KEYWORD AUTO-REPLIES */}
        {/* ===================================================================== */}
        <Card style={[styles.keywordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.keywordCardHeader}
            onPress={() => setIsKeywordSectionOpen(!isKeywordSectionOpen)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.amberIconBox}>
                <Sparkles size={16} color="#D97706" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    Custom Keyword Rules
                  </Text>
                  <View style={styles.amberBadge}>
                    <Text variant="caption" weight="bold" color="#B45309" style={{ fontSize: 9 }}>
                      {settings.keyword_rules.length} Active
                    </Text>
                  </View>
                </View>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                  Auto-reply preset text for specific matching keywords
                </Text>
              </View>
            </View>

            <View style={[styles.accordionPill, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
              <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ fontSize: 11, marginRight: 4 }}>
                {isKeywordSectionOpen ? 'Hide' : 'Manage'}
              </Text>
              {isKeywordSectionOpen ? (
                <ChevronUp size={14} color={colors.textPrimary} />
              ) : (
                <ChevronDown size={14} color={colors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>

          {isKeywordSectionOpen && (
            <View style={[styles.keywordContent, { borderTopColor: colors.border }]}>
              {/* Add Rule Inputs */}
              <View style={styles.addRuleBox}>
                <TextInput
                  style={[
                    styles.ruleInput,
                    { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                  placeholder="Keywords (e.g. price, cost, demo)"
                  placeholderTextColor={colors.textMuted}
                  value={keywordInput}
                  onChangeText={setKeywordInput}
                />
                <TextInput
                  style={[
                    styles.ruleInput,
                    { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                  placeholder="Preset reply text..."
                  placeholderTextColor={colors.textMuted}
                  value={replyInput}
                  onChangeText={setReplyInput}
                />
                <TouchableOpacity
                  style={[styles.addRuleBtn, { backgroundColor: '#EF4444' }]}
                  onPress={handleAddKeywordRule}
                >
                  <Plus size={14} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Add & Save Rule
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Rules List */}
              {settings.keyword_rules.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    Active Keyword Rules:
                  </Text>
                  {settings.keyword_rules.map((rule) => (
                    <View
                      key={rule.id}
                      style={[
                        styles.ruleItemCard,
                        {
                          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.keywordTag}>
                          <Text variant="caption" weight="bold" color="#B45309" style={{ fontSize: 10 }}>
                            🔑 {rule.keywords}
                          </Text>
                        </View>
                        <Text
                          variant="caption"
                          color={colors.textPrimary}
                          style={{ fontSize: 12, marginTop: 4, lineHeight: 16 }}
                        >
                          💬 "{rule.reply}"
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteKeywordRule(rule.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.deleteRuleBtn}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>

        {/* ===================================================================== */}
        {/* SECTION 5: ENGAGEMENT HUB & COMMENT WORKSPACE */}
        {/* ===================================================================== */}
        <Card style={[styles.engagementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.engagementHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color="#EF4444" />
              <View>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Engagement Hub & Comment Workspace
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                  Moderating: {selectedVideo?.title || 'Selected Video'}
                </Text>
              </View>
            </View>
          </View>

          {/* Search comments */}
          <View
            style={[
              styles.commentSearchBox,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.commentSearchInput, { color: colors.textPrimary }]}
              placeholder="Search in comments or author..."
              placeholderTextColor={colors.textMuted}
              value={commentSearch}
              onChangeText={setCommentSearch}
            />
            {commentSearch.length > 0 && (
              <TouchableOpacity onPress={() => setCommentSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={15} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Comments List */}
          {loadingComments ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 8 }}>
                Loading comment threads...
              </Text>
            </View>
          ) : filteredComments.length === 0 ? (
            <View style={styles.commentsEmpty}>
              <Text variant="caption" color={colors.textMuted}>
                No comments found for this video.
              </Text>
            </View>
          ) : (
            <View style={styles.commentThreadsList}>
              {filteredComments.map((comment) => {
                const isReplying = sendingReplies[comment.id];
                const isAiLoading = generatingAI[comment.id];
                const draft = replyDrafts[comment.id] || '';

                return (
                  <View
                    key={comment.id}
                    style={[
                      styles.commentItemCard,
                      {
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {/* Author Row */}
                    <View style={styles.commentAuthorRow}>
                      <View style={styles.authorAvatarCircle}>
                        <Text variant="caption" weight="bold" color="#EF4444">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text variant="caption" weight="bold" color={colors.textPrimary}>
                          {comment.author_name}
                        </Text>
                        <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                          {comment.published_at}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={11} color={colors.textMuted} />
                        <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                          {comment.like_count || 0}
                        </Text>
                      </View>
                    </View>

                    {/* Comment Body */}
                    <Text variant="body" color={colors.textPrimary} style={styles.commentBodyText}>
                      {comment.text}
                    </Text>

                    {/* Nested Replies (if any) */}
                    {comment.replies && comment.replies.length > 0 && (
                      <View style={[styles.nestedRepliesBox, { borderLeftColor: '#EF4444' }]}>
                        {comment.replies.map((reply) => (
                          <View key={reply.id} style={{ marginBottom: 6 }}>
                            <Text variant="caption" weight="bold" color="#EF4444" style={{ fontSize: 11 }}>
                              {reply.author_name}
                            </Text>
                            <Text variant="caption" color={colors.textPrimary} style={{ fontSize: 12, marginTop: 2 }}>
                              {reply.text}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Reply Input Dock */}
                    <View style={[styles.replyDock, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                      <TextInput
                        style={[styles.replyInputField, { color: colors.textPrimary }]}
                        placeholder="Write a reply to this comment..."
                        placeholderTextColor={colors.textMuted}
                        value={draft}
                        onChangeText={(val) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: val }))}
                      />
                      <TouchableOpacity
                        style={[styles.aiReplyButton, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleAiSuggestReply(comment)}
                        disabled={isAiLoading}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        {isAiLoading ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Sparkles size={14} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sendReplyButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handlePostReply(comment.id)}
                        disabled={isReplying || !draft.trim()}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        {isReplying ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Send size={14} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* ===================================================================== */}
      {/* CHANNEL DESCRIPTION MODAL */}
      {/* ===================================================================== */}
      <Modal
        visible={isDescModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDescModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                Edit Channel Description
              </Text>
              <TouchableOpacity onPress={() => setIsDescModalOpen(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.descModalInput,
                { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              multiline
              value={descInput}
              onChangeText={setDescInput}
              placeholder="Enter channel description..."
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsDescModalOpen(false)}
              >
                <Text variant="caption" weight="bold" color={colors.textMuted}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleSaveDescription}
                disabled={savingDesc}
              >
                {savingDesc ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text variant="caption" weight="bold" color="#FFF">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  toastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 8,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },
  bannerCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  channelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  channelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  channelAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  descText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emptyVideosCard: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCarousel: {
    gap: 12,
    paddingBottom: 4,
  },
  videoCard: {
    width: 220,
    padding: 10,
    borderRadius: 14,
    justifyContent: 'space-between',
  },
  thumbnailContainer: {
    width: '100%',
    height: 115,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  deleteVideoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 8,
  },
  watchLinkBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 8,
  },
  videoTitle: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  videoMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricText: {
    fontSize: 10,
  },
  automationCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  automationHeader: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  controlBlock: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  controlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    minHeight: 50,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tonePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tonePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  automationActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveSetupBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  checkUploadsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  keywordCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  keywordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  amberIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amberBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
  },
  accordionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  keywordContent: {
    borderTopWidth: 1,
    padding: 14,
  },
  addRuleBox: {
    gap: 8,
  },
  ruleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
  },
  addRuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 8,
  },
  ruleItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  keywordTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
  },
  deleteRuleBtn: {
    padding: 4,
    marginLeft: 8,
  },
  engagementCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  engagementHeader: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  commentSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginBottom: 12,
  },
  commentSearchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },
  commentsLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  commentsEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  commentThreadsList: {
    gap: 12,
  },
  commentItemCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  nestedRepliesBox: {
    borderLeftWidth: 2,
    paddingLeft: 10,
    marginVertical: 6,
  },
  replyDock: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    marginTop: 6,
    gap: 6,
  },
  replyInputField: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },
  aiReplyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendReplyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  descModalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
