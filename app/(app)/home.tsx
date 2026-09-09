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
import { ClientLogoBadge } from '../../src/components/ClientLogoBadge';
import { GrowthChart } from '../../src/components/GrowthChart';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import { useTranslation } from '../../src/i18n';
import { statsApi } from '../../src/api/stats';
import { authApi } from '../../src/api/auth';
import { newsApi } from '../../src/api/news';
import { crmApi, ContactFollowUp } from '../../src/api/crm';
import { LeadStageBadge } from '../../src/components/crm/LeadStageBadge';
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
  Activity,
  Calendar,
  Clock,
  Bell,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
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

  const { data: upcomingFollowUps, isLoading: followUpsLoading, refetch: refetchFollowUps } = useQuery<ContactFollowUp[]>({
    queryKey: ['upcomingFollowUps'],
    queryFn: () => crmApi.getUpcomingFollowUps(),
  });

  const onRefresh = () => {
    refetchClientStats();
    refetchMonitoringStats();
    refetchNews();
    refetchFollowUps();
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
              {t('home.welcomeBack')}
            </Text>
            <Text variant="h1" weight="bold" color={colors.textPrimary}>
              {userName}
            </Text>
          </View>
          <ClientLogoBadge
            logoUri={clientLogoUri}
            initial={(companyName || 'U').charAt(0)}
            size={42}
          />
        </View>

        {/* Overview Snapshot */}
        <Text variant="label" style={styles.sectionLabel}>
          {t('home.overviewSnapshot')}
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
                {resourceCounts.connectors} {t('home.connectors')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.connectorsDesc')}
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
                {resourceCounts.projects} {t('home.activeFlows')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.activeFlowsDesc')}
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
                {resourceCounts.teamMembers} {t('home.members')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.membersDesc')}
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.gridCardTouch}
            onPress={() => router.push('/knowledge' as any)}
          >
            <Card style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
                <FileText size={20} color={colors.warning} />
              </View>
              <Text variant="h3" weight="bold" color={colors.warning} style={styles.statValue}>
                {resourceCounts.pdfs} {t('home.kbDocuments')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.kbDocumentsDesc')}
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
                {resourceCounts.crmLeads ?? clientStats?.activeUsers ?? 0} {t('home.crmLeads')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.crmLeadsDesc')}
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
                {resourceCounts.products} {t('home.products')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('home.productsDesc')}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Upcoming CRM Follow-Ups Widget */}
        <View style={styles.sectionHeaderRow}>
          <Calendar size={18} color={colors.primary} />
          <Text variant="label" style={styles.newsSectionLabel}>
            {t('home.upcomingFollowUps')}
          </Text>
          {Boolean(upcomingFollowUps && upcomingFollowUps.length > 0) && (
            <View style={[styles.countBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Text variant="caption" weight="bold" color={colors.primary}>
                {upcomingFollowUps?.length}
              </Text>
            </View>
          )}
        </View>

        {upcomingFollowUps && upcomingFollowUps.length > 0 ? (
          <View style={styles.followUpsList}>
            {upcomingFollowUps.slice(0, 4).map((fu) => {
              const isOverdue = fu.is_overdue;
              const dateObj = new Date(fu.scheduled_at);
              const isToday = dateObj.toDateString() === new Date().toDateString();
              const timeFormatted = isToday
                ? `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <TouchableOpacity
                  key={fu.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/lead/${fu.contact}` as any)}
                >
                  <Card
                    style={[
                      styles.fuCard,
                      isOverdue && { borderColor: '#EF4444', borderWidth: 1 },
                    ]}
                  >
                    <View style={styles.fuHeader}>
                      <View style={styles.fuTypeBadge}>
                        {fu.follow_up_type === 'CALL' ? (
                          <Phone size={13} color="#2563EB" />
                        ) : fu.follow_up_type === 'MESSAGE' ? (
                          <MessageSquare size={13} color="#16A34A" />
                        ) : fu.follow_up_type === 'MEETING' ? (
                          <Users size={13} color="#9333EA" />
                        ) : (
                          <Mail size={13} color="#EA580C" />
                        )}
                        <Text style={[styles.fuTypeText, { color: colors.textSecondary }]}>
                          {fu.follow_up_type}
                        </Text>
                      </View>

                      {isOverdue ? (
                        <View style={[styles.statusTag, { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.statusTagText, { color: '#DC2626' }]}>OVERDUE</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusTag, { backgroundColor: `${colors.primary}15` }]}>
                          <Clock size={10} color={colors.primary} />
                          <Text style={[styles.statusTagText, { color: colors.primary }]}>{timeFormatted}</Text>
                        </View>
                      )}
                    </View>

                    <Text variant="h3" weight="bold" color={colors.textPrimary} numberOfLines={1} style={styles.fuTitle}>
                      {fu.title}
                    </Text>

                    <View style={styles.fuFooter}>
                      <View style={styles.fuContactInfo}>
                        <Avatar name={fu.contact_name || 'Lead'} size="xs" />
                        <Text variant="caption" weight="medium" color={colors.textSecondary} numberOfLines={1}>
                          {fu.contact_name || 'Lead'}
                        </Text>
                        {fu.contact_stage ? (
                          <LeadStageBadge stage={fu.contact_stage} size="sm" />
                        ) : null}
                      </View>

                      <View style={styles.fuArrow}>
                        <Text variant="caption" weight="bold" color={colors.primary}>
                          {t('home.viewLead')}
                        </Text>
                        <ChevronRight size={14} color={colors.primary} />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.allCrmBtn, { borderColor: colors.border }]}
              onPress={() => router.push('/crm')}
            >
              <Text variant="caption" weight="bold" color={colors.primary}>
                {t('home.viewAllCrmLeads')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Card variant="outlined" style={styles.emptyFuCard}>
            <View style={styles.emptyFuRow}>
              <Bell size={20} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="medium" color={colors.textPrimary}>
                  {t('home.allCaughtUp')}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  {t('home.allCaughtUpDesc')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Growth Chart — matches web dashboard */}
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

        {/* Industry News & Market Updates Section */}
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  followUpsList: {
    gap: 8,
    marginBottom: 12,
  },
  fuCard: {
    padding: 12,
    gap: 8,
  },
  fuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fuTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fuTypeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fuTitle: {
    fontSize: 14,
  },
  fuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  fuContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fuArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  allCrmBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 2,
  },
  emptyFuCard: {
    padding: 14,
    marginBottom: 12,
  },
  emptyFuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
