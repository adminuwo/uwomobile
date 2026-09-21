import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { ClientLogoBadge } from '../../src/components/ClientLogoBadge';
import { GrowthChart } from '../../src/components/GrowthChart';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import { useTranslation } from '../../src/i18n';
import { statsApi } from '../../src/api/stats';
import { authApi } from '../../src/api/auth';
import { newsApi } from '../../src/api/news';
import { legalApi } from '../../src/api/legal';
import { LegalConsentModal } from '../../src/components/legal/LegalConsentModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';
import { secureStorage } from '../../src/services/secureStore';
import { APP_CONFIG } from '../../src/config/app-config';
import { 
  Share2,
  Link2,
  Sparkles,
  GitBranch,
  Users,
  Brain,
  FolderKanban,
  ShoppingBag,
  Newspaper,
  ExternalLink,
  ChevronRight
} from 'lucide-react-native';
import { useContentStore } from '../../src/stores/contentStore';
import { useConnectorsTabStore } from '../../src/stores/connectorsTabStore';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isChannelActive } = useChannelAccess();
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const brand = useBrandStore((state) => state.brand);
  const getContent = useContentStore((state) => state.getContent);
  const isFeatureEnabled = useContentStore((state) => state.isFeatureEnabled);
  const checkVersionAndSync = useContentStore((state) => state.checkVersionAndSync);

  const userKey = user?.id || user?.email || 'default_user';

  const { data: profileData } = useQuery({
    queryKey: ['userProfile', userKey],
    queryFn: async () => {
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          setUser(profile);
          secureStorage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(profile)).catch(() => {});
        }
        return profile;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  const currentUser = user || profileData;

  const { data: clientStats, isLoading: clientStatsLoading, refetch: refetchClientStats } = useQuery({
    queryKey: ['clientStats', userKey],
    queryFn: () => statsApi.getClientStats(),
    enabled: !!user,
  });

  const { data: monitoringStats, isLoading: monitoringStatsLoading, refetch: refetchMonitoringStats } = useQuery({
    queryKey: ['monitoringStats', userKey],
    queryFn: () => statsApi.getMonitoringStats(),
    enabled: !!user,
  });

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ['newsFeed'],
    queryFn: () => newsApi.getNewsFeed('technology'),
  });

  const { data: consentStatus, refetch: refetchConsent } = useQuery({
    queryKey: ['legalConsentStatus', userKey],
    queryFn: () => legalApi.getConsentStatus(),
    enabled: !!user,
  });

  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    if (consentStatus?.requires_consent) {
      setShowConsentModal(true);
    }
  }, [consentStatus]);

  const onRefresh = () => {
    checkVersionAndSync().catch(() => {});
    refetchClientStats();
    refetchMonitoringStats();
    refetchNews();
    refetchConsent();
  };

  // User's personal profile name (name / full name / first name)
  const isInvalid = (str?: string | null) => !str || !str.trim() || str.trim().toLowerCase() === 'test';

  const userFullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim();
  const clientProfileName =
    (!isInvalid(currentUser?.name) ? currentUser!.name!.trim() : null) ||
    (!isInvalid(userFullName) ? userFullName : null) ||
    (!isInvalid(currentUser?.first_name) ? currentUser!.first_name!.trim() : null) ||
    (currentUser?.email ? currentUser.email.split('@')[0] : null) ||
    (!isInvalid(currentUser?.client?.business_name) ? currentUser!.client!.business_name!.trim() : null) ||
    'User';

  const clientPlan = currentUser?.client?.plan || currentUser?.plan || 'PRO';

  const clientLogoUri = 
    currentUser?.client?.company_logo_url || 
    currentUser?.client?.logo_url || 
    currentUser?.client?.logo || 
    currentUser?.client?.company_logo ||
    currentUser?.company_logo_url || 
    currentUser?.company_logo || 
    currentUser?.avatar || 
    brand.logo_url;

  const resourceCounts = clientStats?.resourceCounts || {
    connectors: 0,
    projects: 0,
    teamMembers: 0,
    pdfs: 0,
    products: 0,
    crmLeads: 0,
  };

  // ── REAL DATA FOR CHANNELS, CONNECTORS & FEATURES ──
  const clientObj = currentUser?.client;

  // 1. CHANNELS: WhatsApp, Instagram, Facebook, YouTube
  const isWaConnected = Boolean((clientObj?.whatsapp_phone_number_id || (clientObj?.whatsapp_config as any)?.phone_number_id || clientObj?.whatsapp_access_token) && clientObj?.whatsapp_enabled !== false) && isChannelActive('whatsapp');
  const isIgConnected = Boolean(clientObj?.instagram_enabled && ((clientObj?.instagram_config as any)?.page_id || (clientObj?.instagram_config as any)?.access_token || (clientObj?.instagram_config as any)?.username || clientObj?.instagram_enabled)) && isChannelActive('instagram');
  const isFbConnected = Boolean(clientObj?.facebook_enabled && ((clientObj?.facebook_config as any)?.page_id || (clientObj?.facebook_config as any)?.access_token || (clientObj?.facebook_config as any)?.page_name || clientObj?.facebook_enabled)) && isChannelActive('facebook');
  const isYtConnected = Boolean(clientObj?.youtube_enabled && ((clientObj?.youtube_config as any)?.channel_id || clientObj?.youtube_enabled)) && isChannelActive('youtube');

  const channelItems = [
    { key: 'whatsapp', name: 'WhatsApp', connected: isWaConnected, available: isChannelActive('whatsapp') },
    { key: 'instagram', name: 'Instagram', connected: isIgConnected, available: isChannelActive('instagram') },
    { key: 'facebook', name: 'Facebook', connected: isFbConnected, available: isChannelActive('facebook') },
    { key: 'youtube', name: 'YouTube', connected: isYtConnected, available: isChannelActive('youtube') },
  ];
  const availableChannelItems = channelItems.filter((c) => c.available);
  const connectedChannels = channelItems.filter((c) => c.connected);
  const connectedChannelsCount = connectedChannels.length;
  const channelSummaryText = connectedChannels.length > 0 
    ? connectedChannels.map((c) => c.name).join(', ')
    : availableChannelItems.map((c) => c.name).join(', ') || 'WhatsApp, Instagram & Facebook';

  // 2. CONNECTORS: Real count respecting Global Admin & Coming Soon state
  const connectorItems = [
    { key: 'gmail', name: 'Gmail', enabled: Boolean(clientObj?.gmail_enabled) && isChannelActive('gmail') },
    { key: 'outlook', name: '365', enabled: Boolean(clientObj?.outlook_enabled) && isChannelActive('outlook') },
    { key: 'calendar', name: 'Google', enabled: Boolean(clientObj?.google_calendar_enabled) && isChannelActive('google_calendar') },
    { key: 'sheets', name: 'Sheets', enabled: Boolean(clientObj?.google_sheets_enabled) && isChannelActive('google_sheets') },
    { key: 'docs', name: 'Docs', enabled: Boolean(clientObj?.google_docs_enabled || clientObj?.google_slides_enabled) && isChannelActive('google_docs') },
    { key: 'onedrive', name: 'OneDrive', enabled: Boolean(clientObj?.onedrive_enabled) && isChannelActive('onedrive') },
    { key: 'zoho', name: 'Zoho', enabled: Boolean(clientObj?.zoho_enabled) && isChannelActive('zoho') },
  ];
  const activeConnectors = connectorItems.filter((c) => c.enabled);
  const fallbackConnectorsCount = activeConnectors.length;

  const connectorsCount = clientStats?.resourceCounts?.connectors !== undefined
    ? Math.min(clientStats.resourceCounts.connectors, activeConnectors.length)
    : activeConnectors.length;

  const connectorsSummaryText = activeConnectors.length > 0
    ? activeConnectors.slice(0, 4).map((c) => c.name).join(', ')
    : 'No Active Connectors';

  // 3. FEATURES: Actual enabled platform modules for current tenant
  const platformFeatureItems = [
    { key: 'workflows', name: 'Workflows' },
    { key: 'crm', name: 'CRM' },
    { key: 'invoices', name: 'Billing' },
    { key: 'automations', name: 'AI' },
    { key: 'knowledge', name: 'Knowledge' },
    { key: 'proposals', name: 'Proposals' },
    { key: 'catalog', name: 'Catalog' },
    { key: 'broadcasts', name: 'Broadcasts' },
    { key: 'team', name: 'Team' },
  ];
  const enabledFeatures = platformFeatureItems.filter((feat) => isChannelActive(feat.key));
  const enabledFeaturesCount = enabledFeatures.length;
  const featuresSummaryText = enabledFeatures.length > 0
    ? enabledFeatures.slice(0, 4).map((f) => f.name).join(', ')
    : 'Workflows, CRM, Billing & AI';

  const crmLeadsCount = resourceCounts.crmLeads ?? clientStats?.activeUsers ?? 0;
  const newsArticles = newsData?.articles?.slice(0, 4) || [];

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header showLogo showMenu />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={clientStatsLoading || monitoringStatsLoading || newsLoading} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <View style={styles.welcomeNameRow}>
              <Text variant="h2" weight="medium" color={colors.textSecondary}>
                Welcome,{' '}
              </Text>
              <Text variant="h2" weight="bold" color={colors.textPrimary} numberOfLines={1} style={styles.clientProfileNameText}>
                {clientProfileName}
              </Text>
            </View>
            <View style={styles.planBadgeContainer}>
              <View style={[styles.planBadge, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}35` }]}>
                <Text variant="caption" weight="bold" style={{ color: colors.primary, fontSize: 10, letterSpacing: 0.5 }}>
                  {clientPlan.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <ClientLogoBadge
            logoUri={clientLogoUri}
            initial={(clientProfileName || 'U').charAt(0)}
            size={46}
          />
        </View>

        {/* ── SECTION A: OVERVIEW SNAPSHOT (8 SUMMARY CARDS) ── */}
        <Text variant="label" style={styles.sectionLabel}>
          {t('home.overviewSnapshot')}
        </Text>

        {/* Row 1: Channels & Connectors */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => {
              useConnectorsTabStore.getState().setTargetTab('CHANNELS');
              router.push({ pathname: '/(app)/connectors', params: { tab: 'CHANNELS' } } as any);
            }}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.channels').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#10B98118' }]}>
                  <Share2 size={16} color="#10B981" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {connectedChannelsCount} {t('home.channelsConnected')}
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => {
              useConnectorsTabStore.getState().setTargetTab('CONNECTORS');
              router.push({ pathname: '/(app)/connectors', params: { tab: 'CONNECTORS' } } as any);
            }}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.connectors').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#3B82F618' }]}>
                  <Link2 size={16} color="#3B82F6" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {connectorsCount} {t('home.connectorsActive')}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Row 2: Features & Active Flows */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => {
              useConnectorsTabStore.getState().setTargetTab('FEATURES');
              router.push({ pathname: '/(app)/connectors', params: { tab: 'FEATURES' } } as any);
            }}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.features').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#8B5CF618' }]}>
                  <Sparkles size={16} color="#8B5CF6" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {enabledFeaturesCount} {t('home.featuresEnabled')}
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/(app)/workflows' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.activeFlows').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#0284C718' }]}>
                  <GitBranch size={16} color="#0284C7" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {resourceCounts.projects} Active Flows
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Row 3: Members & KB Documents */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/(app)/team' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.members').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#7C3AED18' }]}>
                  <Users size={16} color="#7C3AED" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {resourceCounts.teamMembers} {t('home.members')}
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/(app)/knowledge' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.kbDocuments').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#0D948818' }]}>
                  <Brain size={16} color="#0D9488" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {resourceCounts.pdfs} {t('home.documents')}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Row 4: CRM Leads & Products */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/(app)/crm' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.crmLeads').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#05966918' }]}>
                  <FolderKanban size={16} color="#059669" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {crmLeadsCount} {t('home.leads')}
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/(app)/sales/products' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={styles.cardTopRow}>
                <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.cardCategoryLabel} numberOfLines={1}>
                  {t('home.products').toUpperCase()}
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#D9770618' }]}>
                  <ShoppingBag size={16} color="#D97706" />
                </View>
              </View>
              <Text variant="h3" weight="medium" color={colors.textPrimary} style={styles.statValue}>
                {resourceCounts.products} {t('home.products')}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* ── SECTION B: PERFORMANCE & GROWTH ── */}
        <Text variant="label" style={styles.sectionLabel}>
          {t('home.performanceGrowth')}
        </Text>

        <GrowthChart
          automationRuns={clientStats?.automationRuns ?? 0}
          activeAutomations={resourceCounts.projects}
          unreadMessages={monitoringStats?.unread_conversations ?? 0}
          avgResponse={monitoringStats?.avg_response_time || clientStats?.avgResponse || '14s'}
          colors={colors}
        />

        {/* ── SECTION C: NEWS / UPDATES ── */}
        {isFeatureEnabled('news_feed') && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Newspaper size={18} color={colors.primary} />
              <Text variant="label" style={styles.newsSectionLabel}>
                {t('home.industryNews')}
              </Text>
            </View>

            {newsArticles.length > 0 ? (
              newsArticles.map((article, idx) => (
                <Card key={idx} style={styles.newsCard}>
                  <View style={styles.newsCardHeader}>
                    <Badge label={article.source || 'News'} variant="info" />
                    {article.pub_date ? (
                      <Text variant="caption" color={colors.textMuted}>
                        {article.pub_date.split(' ').slice(0, 4).join(' ')}
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.newsTitle}>
                    {article.title}
                  </Text>
                  {article.snippet ? (
                    <Text variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.newsSnippet}>
                      {article.snippet}
                    </Text>
                  ) : null}
                  {article.link ? (
                    <TouchableOpacity 
                      style={styles.newsLinkBtn}
                      onPress={() => Linking.openURL(article.link)}
                    >
                      <Text variant="caption" weight="bold" color={colors.primary}>
                        {t('home.readFullArticle')}
                      </Text>
                      <ExternalLink size={14} color={colors.primary} />
                    </TouchableOpacity>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card variant="outlined" style={styles.emptyNewsCard}>
                <Text variant="caption" color={colors.textMuted}>
                  {newsLoading ? t('home.fetchingNews') : t('home.noNewsAvailable')}
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <LegalConsentModal
        visible={showConsentModal}
        onConsentAccepted={() => {
          setShowConsentModal(false);
          refetchConsent();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  welcomeText: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  clientProfileNameText: {
    flexShrink: 1,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 12,
  },
  newsSectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridCardTouch: {
    flex: 1,
  },
  gridCard: {
    flex: 1,
    padding: 14,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardCategoryLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
    marginRight: 6,
  },
  cardIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14.5,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  cardDescText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  newsCard: {
    marginBottom: 12,
    padding: 14,
  },
  newsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsTitle: {
    marginBottom: 6,
  },
  newsSnippet: {
    marginBottom: 10,
    lineHeight: 18,
  },
  newsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyNewsCard: {
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
});
