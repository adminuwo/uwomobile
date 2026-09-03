import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { useTheme } from '../../../src/theme';
import { paymentsApi } from '../../../src/api/payments';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';

export default function WalletScreen() {
  const { colors } = useTheme();

  const { data: walletData, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useQuery({
    queryKey: ['walletDashboard'],
    queryFn: paymentsApi.getWalletDashboard
  });

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: paymentsApi.getPaymentHistory
  });

  const isLoading = walletLoading || historyLoading;
  const isError = walletError;

  const onRefresh = () => {
    refetchWallet();
    refetchHistory();
  };

  const renderHeader = () => {
    if (!walletData) return null;
    return (
      <View style={styles.headerContainer}>
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color={colors.primary} />
            <Badge 
              label={walletData.status} 
              variant={walletData.status === 'ACTIVE' ? 'success' : 'error'} 
            />
          </View>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 16 }}>
            Available Balance
          </Text>
          <Text variant="h1" weight="bold" color={colors.primary}>
            {walletData.currency} {walletData.balance.toFixed(2)}
          </Text>
          
          {walletData.balance < walletData.low_balance_threshold && (
            <Text variant="caption" color={colors.error} style={{ marginTop: 8 }}>
              Low balance. Please recharge soon to avoid service interruption.
            </Text>
          )}
        </Card>
        <Text variant="label" style={styles.sectionLabel}>Recent Transactions</Text>
      </View>
    );
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen options={{ title: 'Wallet & Payments', headerShown: true }} />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load wallet data.</Text>
        </View>
      ) : (
        <FlatList
          data={historyData || walletData?.recent_transactions || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={onRefresh}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color={colors.textMuted}>No transactions found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.transactionCard}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: item.amount > 0 ? colors.success + '20' : colors.error + '20' }]}>
                  {item.amount > 0 ? (
                    <ArrowDownRight size={20} color={colors.success} />
                  ) : (
                    <ArrowUpRight size={20} color={colors.error} />
                  )}
                </View>
                <View style={styles.content}>
                  <Text variant="body" weight="medium">
                    {item.amount > 0 ? 'Recharge' : 'Usage Deduction'}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {new Date(item.created_at).toLocaleDateString()} • {item.method || 'System'}
                  </Text>
                </View>
                <View style={styles.rightContent}>
                  <Text variant="body" weight="bold" color={item.amount > 0 ? colors.success : colors.textPrimary}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                  </Text>
                  <Text variant="caption" color={
                    item.status === 'SUCCESS' ? colors.success : 
                    item.status === 'FAILED' ? colors.error : colors.warning
                  }>
                    {item.status}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  balanceCard: {
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionCard: {
    marginBottom: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  }
});
