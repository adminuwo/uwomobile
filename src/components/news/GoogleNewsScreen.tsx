import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
  Linking,
  Dimensions,
  Platform,
  Clipboard as RNClipboard,
} from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Header } from '../Header';
import { Screen } from '../Screen';
import {
  Newspaper,
  Search,
  Sparkles,
  Send,
  Share2,
  ExternalLink,
  RefreshCw,
  Settings as SettingsIcon,
  Copy,
  Check,
  CheckCircle2,
  X,
  Globe,
  Tag,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react-native';
import {
  googleNewsApi,
  GoogleNewsArticle,
  GoogleNewsSettings,
} from '../../api/googleNews';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Google News Logo Emblem
export const GoogleNewsEmblem: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect width="20" height="20" x="2" y="2" rx="4" fill="#4285F4" />
    <Path d="M7 6H17V8H7V6Z" fill="white" />
    <Path d="M7 10H13V12H7V10Z" fill="white" />
    <Path d="M7 14H17V16H7V14Z" fill="white" />
    <Path d="M7 18H14V19H7V18Z" fill="white" />
    <Rect x="15" y="10" width="2" height="3" fill="#34A853" />
  </Svg>
);

const CATEGORIES = [
  { id: '', name: '🔥 Top Stories' },
  { id: 'TECHNOLOGY', name: '💻 Technology' },
  { id: 'BUSINESS', name: '📈 Business' },
  { id: 'WORLD', name: '🌍 World' },
  { id: 'ENTERTAINMENT', name: '🎬 Entertainment' },
  { id: 'SPORTS', name: '⚽ Sports' },
  { id: 'SCIENCE', name: '🚀 Science' },
  { id: 'HEALTH', name: '🏥 Health' },
];

export const GoogleNewsScreen: React.FC = () => {
  const { colors, mode } = useTheme();

  // News & Feed state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<GoogleNewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('TECHNOLOGY');

  // AI Assistant Drawer state
  const [selectedArticle, setSelectedArticle] = useState<GoogleNewsArticle | null>(null);
  const [aiOutput, setAiOutput] = useState('');
  const [aiAction, setAiAction] = useState<'SUMMARIZE' | 'BROADCAST' | 'SOCIAL'>('SUMMARIZE');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Multi-Platform Broadcasting state
  const [sendChannels, setSendChannels] = useState<Record<string, boolean>>({
    WHATSAPP: true,
    FACEBOOK: true,
    INSTAGRAM: true,
  });
  const [broadcasting, setBroadcasting] = useState(false);

  // Settings state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [clientConfig, setClientConfig] = useState<GoogleNewsSettings | null>(null);
  const [configEnabled, setConfigEnabled] = useState(true);
  const [configDefaultTopic, setConfigDefaultTopic] = useState('TECHNOLOGY');
  const [configKeywords, setConfigKeywords] = useState('ai, technology, business');
  const [configTone, setConfigTone] = useState('professional');
  const [savingConfig, setSavingConfig] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load feed from API
  const fetchNews = useCallback(
    async (overrideCategory = activeCategory, overrideQuery = searchQuery) => {
      setLoading(true);
      try {
        const res = await googleNewsApi.getFeed({
          category: overrideQuery.trim() ? undefined : overrideCategory || undefined,
          query: overrideQuery.trim() || undefined,
        });
        if (res && res.articles) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.log('[GoogleNewsScreen] Error loading feed:', err);
        showToast('Failed to refresh Google News feed', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeCategory, searchQuery]
  );

  // Load settings
  const fetchSettings = useCallback(async () => {
    try {
      const cfg = await googleNewsApi.getSettings();
      setClientConfig(cfg);
      setConfigEnabled(cfg.enabled);
      setConfigDefaultTopic(cfg.default_topic || 'TECHNOLOGY');
      setConfigKeywords(
        Array.isArray(cfg.keywords) ? cfg.keywords.join(', ') : cfg.keywords || 'ai, technology, business'
      );
      setConfigTone(cfg.auto_summary_tone || 'professional');

      if (cfg.default_topic) {
        setActiveCategory(cfg.default_topic);
        fetchNews(cfg.default_topic, '');
        return;
      }
    } catch (err) {
      console.log('[GoogleNewsScreen] Error loading settings:', err);
    }
    fetchNews(activeCategory, '');
  }, [activeCategory, fetchNews]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle category selection
  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    setSearchQuery('');
    fetchNews(catId, '');
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setActiveCategory('');
    fetchNews('', searchQuery);
  };

  // Generate AI Summary or Broadcast
  const handleOpenAIModal = async (
    article: GoogleNewsArticle,
    actionType: 'SUMMARIZE' | 'BROADCAST' | 'SOCIAL' = 'SUMMARIZE'
  ) => {
    setSelectedArticle(article);
    setAiAction(actionType);
    setIsAiModalOpen(true);
    setGeneratingAI(true);
    setAiOutput('');

    try {
      const res = await googleNewsApi.summarizeArticle({
        title: article.title,
        snippet: article.snippet,
        source: article.source,
        link: article.link,
        action: actionType,
      });

      if (res && res.ai_output) {
        setAiOutput(res.ai_output);
      }
    } catch (err) {
      console.log('[GoogleNewsScreen] AI generation error:', err);
      showToast('Could not generate AI summary', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Switch AI action tab inside modal
  const handleSwitchAiAction = async (newAction: 'SUMMARIZE' | 'BROADCAST' | 'SOCIAL') => {
    if (!selectedArticle) return;
    setAiAction(newAction);
    setGeneratingAI(true);
    setAiOutput('');

    try {
      const res = await googleNewsApi.summarizeArticle({
        title: selectedArticle.title,
        snippet: selectedArticle.snippet,
        source: selectedArticle.source,
        link: selectedArticle.link,
        action: newAction,
      });

      if (res && res.ai_output) {
        setAiOutput(res.ai_output);
      }
    } catch (err) {
      console.log('[GoogleNewsScreen] AI action error:', err);
      showToast('Could not switch AI mode', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Toggle server-side broadcast channel
  const toggleChannel = (ch: string) => {
    setSendChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  // Server broadcast to WhatsApp, Facebook, Instagram
  const handleServerBroadcast = async () => {
    if (!selectedArticle) return;
    const channels = Object.keys(sendChannels).filter((k) => sendChannels[k]);
    if (channels.length === 0) {
      showToast('Select at least 1 channel (WA, FB, or IG) to broadcast', 'error');
      return;
    }

    setBroadcasting(true);
    try {
      const res = await googleNewsApi.sendAlert({
        title: selectedArticle.title,
        snippet: selectedArticle.snippet,
        link: selectedArticle.link,
        source: selectedArticle.source,
        custom_text: aiOutput || undefined,
        send_channels: channels,
      });

      if (res) {
        const parts: string[] = [];
        if (res.whatsapp_count > 0) parts.push(`📱 WhatsApp: ${res.whatsapp_count}`);
        if (res.facebook_count > 0) parts.push(`💙 FB: ${res.facebook_count}`);
        if (res.instagram_count > 0) parts.push(`📸 IG: ${res.instagram_count}`);

        const detail = parts.length > 0 ? parts.join(', ') : res.detail || `${res.sent_count} recipients`;
        showToast(`✅ Alert Broadcasted! ${detail}`);

        if (res.fb_error && res.facebook_count === 0) {
          setTimeout(() => showToast(`💙 FB: ${res.fb_error}`, 'error'), 1200);
        }
        if (res.ig_error && res.instagram_count === 0) {
          setTimeout(() => showToast(`📸 IG: ${res.ig_error}`, 'error'), 2400);
        }
      }
    } catch (err) {
      console.log('[GoogleNewsScreen] Broadcast error:', err);
      showToast('Broadcast failed to deliver.', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  // Native Device Share sheet (WhatsApp, Telegram, X, Instagram, LinkedIn, etc.)
  const handleNativeShare = async () => {
    if (!selectedArticle) return;
    try {
      const contentToShare = aiOutput
        ? `${selectedArticle.title}\n\n${aiOutput}\n\nRead full story: ${selectedArticle.link}`
        : `${selectedArticle.title}\n\n${selectedArticle.snippet}\n\nRead full story: ${selectedArticle.link}`;

      const result = await Share.share({
        title: selectedArticle.title,
        message: contentToShare,
        url: selectedArticle.link,
      });

      if (result.action === Share.sharedAction) {
        showToast('Shared successfully!');
      }
    } catch (err) {
      console.log('[GoogleNewsScreen] Native share error:', err);
    }
  };

  // Quick native share directly from news card
  const handleQuickCardShare = async (article: GoogleNewsArticle) => {
    try {
      await Share.share({
        title: article.title,
        message: `📰 ${article.title}\n\n${article.snippet}\n\nSource: ${article.source}\n🔗 ${article.link}`,
        url: article.link,
      });
    } catch (err) {
      console.log('[GoogleNewsScreen] Quick card share error:', err);
    }
  };

  // Copy AI output
  const handleCopyAiOutput = () => {
    if (!aiOutput) return;
    try {
      if (RNClipboard && typeof RNClipboard.setString === 'function') {
        RNClipboard.setString(aiOutput);
      }
    } catch {
      // fallback
    }
    setCopied(true);
    showToast('📋 Copied AI text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Save Config Settings
  const handleSaveConfig = async (isToggling?: boolean) => {
    setSavingConfig(true);
    try {
      const targetEnabled = isToggling !== undefined ? isToggling : configEnabled;
      const keywordsArr = configKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      await googleNewsApi.updateSettings({
        enabled: targetEnabled,
        default_topic: configDefaultTopic,
        keywords: keywordsArr,
        auto_summary_tone: configTone,
      });

      setConfigEnabled(targetEnabled);
      showToast('Google News settings saved!');
      setIsConfigModalOpen(false);
      fetchSettings();
    } catch (err) {
      console.log('[GoogleNewsScreen] Save settings error:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        title="Google News"
        showMenu={true}
        rightElement={
          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
              onPress={() => {
                setRefreshing(true);
                fetchNews(activeCategory, searchQuery);
              }}
              disabled={loading || refreshing}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCw size={16} color={refreshing ? '#3B82F6' : colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
              onPress={() => setIsConfigModalOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SettingsIcon size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Toast Bar */}
      {toastMsg && (
        <View
          style={[
            styles.toastBar,
            { backgroundColor: toastType === 'error' ? '#EF4444' : '#059669' },
          ]}
        >
          <CheckCircle2 size={16} color="#FFF" />
          <Text variant="caption" weight="bold" color="#FFF" style={{ flex: 1, marginLeft: 6 }}>
            {toastMsg}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerHeaderRow}>
            <View style={styles.bannerIconWrapper}>
              <GoogleNewsEmblem size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTitleRow}>
                <Text variant="h3" weight="bold" color="#FFFFFF">
                  Google News Hub
                </Text>
                <View style={styles.liveBadge}>
                  <Text variant="caption" weight="bold" color="#10B981" style={{ fontSize: 9 }}>
                    LIVE RSS
                  </Text>
                </View>
              </View>
              <Text variant="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }}>
                Real-time trend monitoring, keyword search & AI summaries
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.bannerButtonsRow}>
            <TouchableOpacity
              style={styles.bannerGlassBtn}
              onPress={() => {
                setRefreshing(true);
                fetchNews(activeCategory, searchQuery);
              }}
              disabled={loading || refreshing}
            >
              <RefreshCw size={13} color="#FFFFFF" />
              <Text variant="caption" weight="bold" color="#FFFFFF" style={{ marginLeft: 6 }}>
                {refreshing ? 'Refreshing...' : 'Refresh Feed'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bannerWhiteBtn}
              onPress={() => setIsConfigModalOpen(true)}
            >
              <SettingsIcon size={13} color="#1D4ED8" />
              <Text variant="caption" weight="bold" color="#1D4ED8" style={{ marginLeft: 6 }}>
                Configure
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Controls & Search Bar */}
        <View
          style={[
            styles.controlsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.searchBarWrapper,
              {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search keyword or topic on Google News..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  fetchNews(activeCategory, '');
                }}
                style={{ marginRight: 6 }}
              >
                <X size={14} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit}>
              <Text variant="caption" weight="bold" color="#FFF">
                Search
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id && !searchQuery;
              return (
                <TouchableOpacity
                  key={cat.id || 'all'}
                  onPress={() => handleCategorySelect(cat.id)}
                  style={[
                    styles.categoryPill,
                    isSelected
                      ? styles.categoryPillActive
                      : [
                          styles.categoryPillInactive,
                          {
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                            borderColor: colors.border,
                          },
                        ],
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    style={{ fontSize: 11 }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="caption" weight="bold" color={colors.textMuted} style={{ letterSpacing: 0.8 }}>
            {searchQuery
              ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`
              : `${activeCategory || 'TOP'} STORIES`}{' '}
            ({articles.length})
          </Text>
        </View>

        {/* 3. Articles Feed */}
        {loading ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 12 }} />
            <Text variant="body" weight="bold" color={colors.textSecondary}>
              Fetching Google News Feed...
            </Text>
          </View>
        ) : articles.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Newspaper size={40} color={colors.textMuted} style={{ marginBottom: 10 }} />
            <Text variant="body" weight="bold" color={colors.textPrimary}>
              No news articles found
            </Text>
            <Text
              variant="caption"
              color={colors.textMuted}
              style={{ textAlign: 'center', marginTop: 4 }}
            >
              Try searching for a different keyword or select another topic tab.
            </Text>
          </View>
        ) : (
          <View style={styles.articlesList}>
            {articles.map((article, index) => {
              const formattedDate = article.pub_date
                ? new Date(article.pub_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <View
                  key={`${article.link}-${index}`}
                  style={[
                    styles.articleCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Source & Date */}
                  <View style={styles.articleHeaderRow}>
                    <View style={styles.sourceTag}>
                      <Text
                        variant="caption"
                        weight="bold"
                        color="#1D4ED8"
                        style={{ fontSize: 10 }}
                        numberOfLines={1}
                      >
                        {article.source}
                      </Text>
                    </View>
                    <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                      {formattedDate}
                    </Text>
                  </View>

                  {/* Title */}
                  <TouchableOpacity
                    onPress={() => article.link && Linking.openURL(article.link)}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="body"
                      weight="bold"
                      color={colors.textPrimary}
                      style={styles.articleTitle}
                      numberOfLines={3}
                    >
                      {article.title}
                    </Text>
                  </TouchableOpacity>

                  {/* Snippet */}
                  {article.snippet ? (
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={styles.articleSnippet}
                      numberOfLines={3}
                    >
                      {article.snippet}
                    </Text>
                  ) : null}

                  {/* Bottom Action Buttons */}
                  <View
                    style={[
                      styles.articleFooterRow,
                      { borderTopColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                    ]}
                  >
                    {/* Read Original Link */}
                    <TouchableOpacity
                      style={styles.readOriginalBtn}
                      onPress={() => article.link && Linking.openURL(article.link)}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        color={colors.textMuted}
                        style={{ fontSize: 10, marginRight: 3 }}
                      >
                        Original
                      </Text>
                      <ExternalLink size={11} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* Quick Native Share Button */}
                    <TouchableOpacity
                      style={[
                        styles.quickShareIconBtn,
                        {
                          backgroundColor:
                            mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleQuickCardShare(article)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Share2 size={13} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Action Pills */}
                    <View style={styles.articleActionPills}>
                      <TouchableOpacity
                        style={styles.aiSummaryPill}
                        onPress={() => handleOpenAIModal(article, 'SUMMARIZE')}
                      >
                        <Sparkles size={11} color="#1D4ED8" />
                        <Text
                          variant="caption"
                          weight="bold"
                          color="#1D4ED8"
                          style={{ fontSize: 10, marginLeft: 4 }}
                        >
                          AI Summary
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.broadcastPill}
                        onPress={() => handleOpenAIModal(article, 'BROADCAST')}
                      >
                        <Send size={11} color="#047857" />
                        <Text
                          variant="caption"
                          weight="bold"
                          color="#047857"
                          style={{ fontSize: 10, marginLeft: 4 }}
                        >
                          Broadcast
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 4. AI News Assistant & Multi-Platform Sharing Modal */}
      <Modal
        visible={isAiModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAiModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aiModalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
            >
              <View style={styles.modalHeaderLeft}>
                <View style={styles.sparkleIconWrapper}>
                  <Sparkles size={16} color="#3B82F6" />
                </View>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  AI News Assistant & Broadcast
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAiModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Selected Article Context Card */}
              {selectedArticle && (
                <View
                  style={[
                    styles.aiContextCard,
                    {
                      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color="#3B82F6"
                    style={{ fontSize: 9, letterSpacing: 0.5 }}
                  >
                    {selectedArticle.source.toUpperCase()}
                  </Text>
                  <Text
                    variant="caption"
                    weight="bold"
                    color={colors.textPrimary}
                    style={{ marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {selectedArticle.title}
                  </Text>
                </View>
              )}

              {/* Mode Tabs */}
              <View
                style={[
                  styles.modeTabsRow,
                  { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ]}
              >
                {[
                  { id: 'SUMMARIZE' as const, label: 'Summary' },
                  { id: 'BROADCAST' as const, label: 'WhatsApp' },
                  { id: 'SOCIAL' as const, label: 'Social Post' },
                ].map((tab) => {
                  const isActive = aiAction === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => handleSwitchAiAction(tab.id)}
                      style={[
                        styles.modeTabBtn,
                        isActive && [
                          styles.modeTabBtnActive,
                          { backgroundColor: colors.surface },
                        ],
                      ]}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        color={isActive ? '#2563EB' : colors.textMuted}
                        style={{ fontSize: 11 }}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Output Content Area */}
              {generatingAI ? (
                <View style={styles.aiLoadingWrapper}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text
                    variant="caption"
                    weight="bold"
                    color={colors.textMuted}
                    style={{ marginTop: 8 }}
                  >
                    Drafting AI content...
                  </Text>
                </View>
              ) : (
                <View style={styles.aiOutputContainer}>
                  <TextInput
                    value={aiOutput}
                    onChangeText={setAiOutput}
                    multiline
                    numberOfLines={7}
                    textAlignVertical="top"
                    placeholder="AI generated content will appear here..."
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.aiTextArea,
                      {
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                  />

                  {/* Multi-Platform Channel Selection */}
                  <View style={styles.channelsSection}>
                    <Text
                      variant="caption"
                      weight="bold"
                      color={colors.textMuted}
                      style={{ fontSize: 10, letterSpacing: 0.5, marginBottom: 6 }}
                    >
                      BROADCAST CHANNELS:
                    </Text>
                    <View style={styles.channelsPillsRow}>
                      {[
                        { id: 'WHATSAPP', label: '📱 WhatsApp', activeBg: '#D1FAE5', activeText: '#065F46', border: '#A7F3D0' },
                        { id: 'FACEBOOK', label: '💙 Facebook', activeBg: '#DBEAFE', activeText: '#1E40AF', border: '#BFDBFE' },
                        { id: 'INSTAGRAM', label: '📸 Instagram', activeBg: '#FCE7F3', activeText: '#9D174D', border: '#FBCFE8' },
                      ].map((ch) => {
                        const isSelected = sendChannels[ch.id];
                        return (
                          <TouchableOpacity
                            key={ch.id}
                            onPress={() => toggleChannel(ch.id)}
                            style={[
                              styles.channelTogglePill,
                              isSelected
                                ? {
                                    backgroundColor: ch.activeBg,
                                    borderColor: ch.border,
                                  }
                                : {
                                    backgroundColor:
                                      mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                                    borderColor: colors.border,
                                    opacity: 0.6,
                                  },
                            ]}
                          >
                            <Text
                              variant="caption"
                              weight="bold"
                              color={isSelected ? ch.activeText : colors.textMuted}
                              style={{ fontSize: 10 }}
                            >
                              {ch.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Action Buttons Row */}
                  <View style={styles.aiActionsRow}>
                    {/* Copy Button */}
                    <TouchableOpacity
                      style={[
                        styles.secondaryActionBtn,
                        {
                          backgroundColor:
                            mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={handleCopyAiOutput}
                    >
                      {copied ? (
                        <Check size={14} color="#10B981" />
                      ) : (
                        <Copy size={14} color={colors.textPrimary} />
                      )}
                      <Text
                        variant="caption"
                        weight="bold"
                        color={copied ? '#10B981' : colors.textPrimary}
                        style={{ marginLeft: 4 }}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>

                    {/* Native Share to Apps */}
                    <TouchableOpacity
                      style={[
                        styles.secondaryActionBtn,
                        {
                          backgroundColor:
                            mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={handleNativeShare}
                    >
                      <Share2 size={14} color="#3B82F6" />
                      <Text
                        variant="caption"
                        weight="bold"
                        color="#3B82F6"
                        style={{ marginLeft: 4 }}
                      >
                        Share App
                      </Text>
                    </TouchableOpacity>

                    {/* Server Broadcast Button */}
                    <TouchableOpacity
                      style={styles.primaryBroadcastBtn}
                      onPress={handleServerBroadcast}
                      disabled={broadcasting}
                    >
                      {broadcasting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Send size={13} color="#FFF" />
                          <Text
                            variant="caption"
                            weight="bold"
                            color="#FFF"
                            style={{ marginLeft: 5 }}
                          >
                            Broadcast
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. Google News Settings Modal */}
      <Modal
        visible={isConfigModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsConfigModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.configModalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
            >
              <View style={styles.modalHeaderLeft}>
                <GoogleNewsEmblem size={22} />
                <Text
                  variant="body"
                  weight="bold"
                  color={colors.textPrimary}
                  style={{ marginLeft: 8 }}
                >
                  News Integration Settings
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsConfigModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Integration Status Toggle */}
              <View
                style={[
                  styles.configSectionBox,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    Integration Status
                  </Text>
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                    {configEnabled
                      ? 'Google News is active for your workspace'
                      : 'Disabled — toggle to enable live monitoring'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    configEnabled
                      ? { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }
                      : { backgroundColor: '#10B981', borderColor: '#059669' },
                  ]}
                  onPress={() => handleSaveConfig(!configEnabled)}
                  disabled={savingConfig}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={configEnabled ? '#DC2626' : '#FFFFFF'}
                    style={{ fontSize: 11 }}
                  >
                    {configEnabled ? 'Disable' : 'Enable'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Default Topic Selector */}
              <View style={styles.configFieldGroup}>
                <Text
                  variant="caption"
                  weight="bold"
                  color={colors.textPrimary}
                  style={styles.fieldLabel}
                >
                  Preferred Default Topic
                </Text>
                <View style={styles.topicOptionsGrid}>
                  {[
                    { id: 'TECHNOLOGY', label: 'Technology' },
                    { id: 'BUSINESS', label: 'Business' },
                    { id: 'WORLD', label: 'World' },
                    { id: 'ENTERTAINMENT', label: 'Entertainment' },
                    { id: 'SPORTS', label: 'Sports' },
                    { id: 'SCIENCE', label: 'Science' },
                  ].map((t) => {
                    const isSelected = configDefaultTopic === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setConfigDefaultTopic(t.id)}
                        style={[
                          styles.topicChip,
                          isSelected
                            ? { backgroundColor: '#3B82F6', borderColor: '#2563EB' }
                            : {
                                backgroundColor:
                                  mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                                borderColor: colors.border,
                              },
                        ]}
                      >
                        <Text
                          variant="caption"
                          weight="bold"
                          color={isSelected ? '#FFF' : colors.textSecondary}
                          style={{ fontSize: 10 }}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Keywords Input */}
              <View style={styles.configFieldGroup}>
                <Text
                  variant="caption"
                  weight="bold"
                  color={colors.textPrimary}
                  style={styles.fieldLabel}
                >
                  Tracked Keywords (comma-separated)
                </Text>
                <TextInput
                  value={configKeywords}
                  onChangeText={setConfigKeywords}
                  placeholder="ai, technology, business, crypto..."
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.configTextInput,
                    {
                      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Summary Tone */}
              <View style={styles.configFieldGroup}>
                <Text
                  variant="caption"
                  weight="bold"
                  color={colors.textPrimary}
                  style={styles.fieldLabel}
                >
                  AI Summary Tone
                </Text>
                <View style={styles.toneOptionsRow}>
                  {['concise', 'friendly', 'professional'].map((t) => {
                    const isSelected = configTone === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setConfigTone(t)}
                        style={[
                          styles.toneChip,
                          isSelected
                            ? { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }
                            : {
                                backgroundColor:
                                  mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                                borderColor: colors.border,
                              },
                        ]}
                      >
                        <Text
                          variant="caption"
                          weight="bold"
                          color={isSelected ? '#1D4ED8' : colors.textSecondary}
                          style={{ textTransform: 'capitalize', fontSize: 11 }}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Save Buttons */}
            <View
              style={[
                styles.configFooterRow,
                { borderTopColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
            >
              <TouchableOpacity
                style={styles.configCancelBtn}
                onPress={() => setIsConfigModalOpen(false)}
              >
                <Text variant="caption" weight="bold" color={colors.textMuted}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.configSaveBtn}
                onPress={() => handleSaveConfig()}
                disabled={savingConfig}
              >
                {savingConfig ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text variant="caption" weight="bold" color="#FFF">
                    Save Configuration
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
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastBar: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // 1. Header Banner
  bannerContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  liveBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  bannerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  bannerGlassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bannerWhiteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // 2. Controls & Search
  controlsCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
  },
  searchSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoriesScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryPillInactive: {
    borderColor: 'transparent',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  // 3. Articles List
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articlesList: {
    gap: 12,
  },
  articleCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  articleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    maxWidth: 160,
  },
  articleTitle: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 6,
  },
  articleSnippet: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  articleFooterRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOriginalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickShareIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  articleActionPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  broadcastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  // 4. AI Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  aiModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: 4,
  },
  aiContextCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  modeTabsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  modeTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  modeTabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  aiLoadingWrapper: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOutputContainer: {
    gap: 12,
  },
  aiTextArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    lineHeight: 18,
    minHeight: 130,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  channelsSection: {
    marginTop: 2,
  },
  channelsPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  channelTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingBottom: 16,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryBroadcastBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // 5. Config Modal
  configModalContent: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  configSectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  configFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  topicOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  configTextInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  toneOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toneChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  configFooterRow: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  configCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  configSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
export default GoogleNewsScreen;
