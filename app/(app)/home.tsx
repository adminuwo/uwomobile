import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
import { MessageSquare, Users, Zap, TrendingUp, ShieldCheck } from 'lucide-react-native';

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const user = useSessionStore((state) => state.user);
  const brand = useBrandStore((state) => state.brand);

  const { data: clientStats, isLoading: clientStatsLoading, refetch: refetchClientStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => statsApi.getClientStats(),
  });

  const { data: monitoringStats, isLoading: monitoringStatsLoading, refetch: refetchMonitoringStats } = useQuery({
    queryKey: ['monitoringStats'],
    queryFn: () => statsApi.getMonitoringStats(),
  });

  const onRefresh = () => {
    refetchClientStats();
    refetchMonitoringStats();
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      {/* Header removed as requested */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={clientStatsLoading || monitoringStatsLoading} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text variant="h1" weight="bold" color={colors.textPrimary}>
              {userName}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Welcome back,
            </Text>
          </View>
          <Avatar 
            name={brand.brand_name || userName} 
            uri={brand.logo_url} 
            size="md" 
            isOnline 
          />
        </View>

        {/* Workspace Brand Badge */}
        <Card variant="default" style={styles.brandCard}>
          <View style={styles.brandCardHeader}>
            <View style={styles.brandCardTitleRow}>
              <ShieldCheck size={20} color={colors.primary} style={styles.brandIcon} />
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                {brand.brand_name || 'UwoConnect Workspace'}
              </Text>
            </View>
            <Badge label={user?.role || 'CLIENT'} variant="success" />
          </View>
          <Text variant="caption" color={colors.textMuted} style={styles.brandSubtitle}>
            {brand.tagline || 'Unified Business Automation & Communication Stack'}
          </Text>
        </Card>

        {/* Stats Grid */}
        <Text variant="label" style={styles.sectionLabel}>
          Overview Snapshot
        </Text>

        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
              <MessageSquare size={20} color={colors.primary} />
            </View>
            <Text variant="h2" weight="bold" style={styles.statValue}>
              {monitoringStats?.unread_conversations ?? '-'}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Unread Messages
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
              <Users size={20} color={colors.secondary} />
            </View>
            <Text variant="h2" weight="bold" style={styles.statValue}>
              {clientStats?.activeUsers ?? '-'}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Total Contacts
            </Text>
          </Card>
        </View>

        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
              <Zap size={20} color={colors.warning} />
            </View>
            <Text variant="h2" weight="bold" style={styles.statValue}>
              {clientStats?.resourceCounts?.projects ?? '-'}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Active Workflows
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.surface }]}>
              <TrendingUp size={20} color={colors.info} />
            </View>
            <Text variant="h2" weight="bold" style={styles.statValue}>
              {monitoringStats?.avg_response_time || '-'}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Avg Response Time
            </Text>
          </Card>
        </View>

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
  },
  brandIcon: {
    marginRight: 8,
  },
  brandSubtitle: {
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  phaseCard: {
    marginTop: 10,
  },
  phaseTitle: {
    marginBottom: 6,
  },
});
