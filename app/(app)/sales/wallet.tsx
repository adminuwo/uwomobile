import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { useTheme } from '../../../src/theme';
import { paymentsApi } from '../../../src/api/payments';
import { AddMoneyModal } from '../../../src/components/sales/AddMoneyModal';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react-native';

export default function WalletScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: walletData, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useQuery({
    queryKey: ['walletDashboard'],
    queryFn: () => paymentsApi.getWalletDashboard()
  });

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: () => paymentsApi.getPaymentHistory()
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
            <View style={styles.rowAlign}>
              <Wallet size={24} color={colors.primary} />
              <Badge 
                label={walletData.status} 
                variant={walletData.status === 'ACTIVE' ? 'success' : 'error'} 
                style={{ marginLeft: 8 }}
              />
            </View>
            <TouchableOpacity
              style={[styles.addMoneyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={14} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                Add Money
              </Text>
            </TouchableOpacity>
          </View>

          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 16 }}>
            Available Balance
          </Text>
          <Text variant="h1" weight="bold" color={colors.primary}>
            {walletData.currency || '₹'} {walletData.balance.toFixed(2)}
          </Text>
          
          {walletData.balance < (walletData.low_balance_threshold || 500) && (
            <Text variant="caption" color={colors.error} style={{ marginTop: 8 }}>
              ⚠️ Low balance alert. Please recharge to keep WhatsApp & AI automations active.
            </Text>
          )}
        </Card>
        <Text variant="label" style={styles.sectionLabel}>Recent Transactions</Text>
      </View>
    );
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Wallet & Payments', 
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={[styles.topAddBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                Recharge
              </Text>
            </TouchableOpacity>
          )
        }} 
      />
      
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
          data={historyData?.length ? historyData : walletData?.recent_transactions || []}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={onRefresh}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color={colors.textMuted}>No transaction history found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const amt = item.amount || item.amount_inr || 0;
            const isCredit = amt > 0 || item.type === 'CREDIT';
            return (
              <Card style={styles.transactionCard}>
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: isCredit ? colors.success + '20' : colors.error + '20' }]}>
                    {isCredit ? (
                      <ArrowDownRight size={20} color={colors.success} />
                    ) : (
                      <ArrowUpRight size={20} color={colors.error} />
                    )}
                  </View>
                  <View style={styles.content}>
                    <Text variant="body" weight="medium">
                      {item.description || (isCredit ? 'Wallet Recharge' : 'Usage Deduction')}
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      {new Date(item.created_at || Date.now()).toLocaleDateString()} • {item.method || item.service_category || 'System'}
                    </Text>
                  </View>
                  <View style={styles.rightContent}>
                    <Text variant="body" weight="bold" color={isCredit ? colors.success : colors.textPrimary}>
                      {isCredit ? '+' : ''}₹{Math.abs(amt).toFixed(2)}
                    </Text>
                    <Text variant="caption" color={
                      item.status === 'SUCCESS' || item.status === 'COMPLETED' ? colors.success : 
                      item.status === 'FAILED' ? colors.error : colors.warning
                    }>
                      {item.status || 'SUCCESS'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}

      <AddMoneyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={onRefresh}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
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
    padding: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
