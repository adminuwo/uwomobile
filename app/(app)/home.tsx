import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Avatar } from '../../src/components/Avatar';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import { statsApi } from '../../src/api/stats';
import { authApi } from '../../src/api/auth';
import { newsApi } from '../../src/api/news';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Share2, 
  GitBranch, 
  FileText, 
  Package,
  FolderKanban,
  Newspaper,
  ExternalLink,
  Activity
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const brand = useBrandStore((state) => state.brand);

  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          setUser(profile);
        }
        return profile;
      } catch {
        return null;
      }
    },
  });

  const currentUser = profileData || user;

  const { data: clientStats, isLoading: clientStatsLoading, refetch: refetchClientStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => statsApi.getClientStats(),
  });

  const { data: monitoringStats, isLoading: monitoringStatsLoading, refetch: refetchMonitoringStats } = useQuery({
    queryKey: ['monitoringStats'],
    queryFn: () => statsApi.getMonitoringStats(),
  });

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ['newsFeed'],
    queryFn: () => newsApi.getNewsFeed('technology'),
  });

  const onRefresh = () => {
    refetchClientStats();
    refetchMonitoringStats();
    refetchNews();
  };

  const userName = currentUser?.name || currentUser?.first_name || currentUser?.email?.split('@')[0] || 'User';
  const companyName = 
    currentUser?.client?.business_name || 
    currentUser?.client?.company_name || 
    currentUser?.company_name || 
    (brand.brand_name && brand.brand_name !== 'UwoConnect' ? brand.brand_name : null) || 
    'My Workspace';

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

  const newsArticles = newsData?.articles?.slice(0, 4) || [];

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header showLogo showMenu />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={clientStatsLoading || monitoringStatsLoading || newsLoading} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text variant="caption" color={colors.textMuted}>
              Welcome back,
            </Text>
            <Text variant="h1" weight="bold" color={colors.textPrimary}>
              {userName}
            </Text>
          </View>
        </View>

        {/* Overview Snapshot */}
        <Text variant="label" style={styles.sectionLabel}>
          OVERVIEW SNAPSHOT
        </Text>

        {/* Primary Row: Connectors & Active Workflows */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/connectors' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <Share2 size={20} color={colors.primary} />
              </View>
              <Text variant="h3" weight="bold" color={colors.primary} style={styles.statValue}>
                {resourceCounts.connectors} Connectors
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                WhatsApp, IG, Email & Social
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/workflows' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <GitBranch size={20} color={colors.info} />
              </View>
              <Text variant="h3" weight="bold" color={colors.info} style={styles.statValue}>
                {resourceCounts.projects} Active Flows
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Automated routing & AI replies
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Secondary Row: Team & Knowledge PDFs */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/team' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <Users size={20} color={colors.secondary} />
              </View>
              <Text variant="h3" weight="bold" color={colors.secondary} style={styles.statValue}>
                {resourceCounts.teamMembers} Members
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Active agents & supervisors
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/more')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <FileText size={20} color={colors.warning} />
              </View>
              <Text variant="h3" weight="bold" color={colors.warning} style={styles.statValue}>
                {resourceCounts.pdfs} KB Documents
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Trained docs & system KB
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* CRM & Catalog Row */}
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/crm')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <FolderKanban size={20} color={colors.success} />
              </View>
              <Text variant="h3" weight="bold" color={colors.success} style={styles.statValue}>
                {resourceCounts.crmLeads ?? clientStats?.activeUsers ?? 0} CRM Leads
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Pipelines, deals & stages
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/sales/products')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <Package size={20} color={colors.primary} />
              </View>
              <Text variant="h3" weight="bold" color={colors.primary} style={styles.statValue}>
                {resourceCounts.products} Products
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Catalog items & inventory
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Automation Performance & Activity */}
        <Text variant="label" style={styles.sectionLabel}>
          AUTOMATION & LIVE PERFORMANCE
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/more')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <Zap size={20} color={colors.warning} />
              </View>
              <Text variant="h2" weight="bold" style={styles.statValue}>
                {clientStats?.automationRuns ?? 0}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Automation Runs
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/workflows' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <Activity size={20} color={colors.success} />
              </View>
              <Text variant="h2" weight="bold" style={styles.statValue}>
                {resourceCounts.projects}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Active Automations
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/inbox')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <MessageSquare size={20} color={colors.primary} />
              </View>
              <Text variant="h2" weight="bold" style={styles.statValue}>
                {monitoringStats?.unread_conversations ?? 0}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Unread Messages
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/inbox')}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <TrendingUp size={20} color={colors.info} />
              </View>
              <Text variant="h2" weight="bold" style={styles.statValue}>
                {monitoringStats?.avg_response_time || clientStats?.avgResponse || '14s'}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Avg Response Time
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Industry News & Market Updates Section */}
        <View style={styles.sectionHeaderRow}>
          <Newspaper size={18} color={colors.primary} />
          <Text variant="label" style={styles.newsSectionLabel}>
            INDUSTRY NEWS & UPDATES
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
                    Read Full Article
                  </Text>
                  <ExternalLink size={14} color={colors.primary} />
                </TouchableOpacity>
              ) : null}
            </Card>
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyNewsCard}>
            <Text variant="caption" color={colors.textMuted}>
              {newsLoading ? 'Fetching latest tech & business news...' : 'No news updates available right now.'}
            </Text>
          </Card>
        )}

        {/* Phase 1 Mobile Note */}
        <Card variant="outlined" style={styles.phaseCard}>
          <Text variant="label" color={colors.primary} weight="bold" style={styles.phaseTitle}>
            📱 Mobile App Foundation Phase 1
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            Your mobile app is connected to the live UwoConnect Django API. Deep module features (Unified Inbox, CRM Pipelines, Broadcasts) will be activated in upcoming phases.
          </Text>
        </Card>
      </ScrollView>
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
    marginBottom: 18,
  },
  welcomeText: {
    flex: 1,
  },
  brandCard: {
    marginBottom: 22,
  },
  brandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoImage: {
    width: 28,
    height: 28,
    borderRadius: 7,
    marginRight: 4,
    resizeMode: 'contain',
  },
  brandIcon: {
    marginRight: 8,
  },
  brandSubtitle: {
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 10,
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
    padding: 16,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    marginBottom: 2,
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
  phaseCard: {
    marginTop: 14,
  },
  phaseTitle: {
    marginBottom: 6,
  },
});
