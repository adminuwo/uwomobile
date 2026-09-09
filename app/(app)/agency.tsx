import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import {
  Building2,
  Users,
  Globe,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Settings,
  X,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Loader2,
} from 'lucide-react-native';

interface SubClient {
  id: number;
  business_name: string;
  email: string;
  phone_number?: string;
  owner_name?: string;
  plan?: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  agent_count?: number;
  logo_url?: string;
}

interface AgencyStats {
  total_clients?: number;
  active_clients?: number;
  total_agents?: number;
  total_conversations?: number;
}

export default function AgencyScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [subClients, setSubClients] = useState<SubClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SubClient | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Create form
  const [formState, setFormState] = useState({
    business_name: '',
    email: '',
    phone_number: '',
    owner_name: '',
    password: 'Welcome@2026',
    plan: 'STARTER',
  });

  const fetchAgencyData = useCallback(async () => {
    try {
      const [statsData, clientsData] = await Promise.allSettled([
        apiClient.get<AgencyStats>('/api/agency/stats/'),
        apiClient.get<SubClient[]>('/api/agency/sub-clients/'),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (clientsData.status === 'fulfilled') {
        const data = clientsData.value;
        setSubClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Agency data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencyData();
  }, [fetchAgencyData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAgencyData();
  };

  const handleCreateSubClient = async () => {
    if (!formState.business_name || !formState.email) {
      Alert.alert('Required', 'Business name and email are required.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.post('/api/agency/sub-clients/', formState);
      Alert.alert('Success', 'New sub-client workspace created!');
      setShowCreateModal(false);
      setFormState({
        business_name: '',
        email: '',
        phone_number: '',
        owner_name: '',
        password: 'Welcome@2026',
        plan: 'STARTER',
      });
      fetchAgencyData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create sub-client.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (clientId: number, action: string, extraPayload: any = {}) => {
    setActionLoading(true);
    try {
      const result = await apiClient.post<any>(`/api/agency/sub-clients/${clientId}/action/`, {
        action,
        ...extraPayload,
      });
      Alert.alert('Success', result?.message || 'Action completed!');
      fetchAgencyData();
      setShowPasswordModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClients = subClients.filter((c) => {
    const matchSearch =
      !searchQuery ||
      c.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && c.status !== 'SUSPENDED' && c.is_active !== false) ||
      (filterStatus === 'SUSPENDED' && (c.status === 'SUSPENDED' || c.is_active === false));

    return matchSearch && matchStatus;
  });

  const getStatusColor = (client: SubClient) => {
    if (client.status === 'SUSPENDED' || client.is_active === false) return colors.error;
    return colors.success;
  };

  const getStatusLabel = (client: SubClient) => {
    if (client.status === 'SUSPENDED' || client.is_active === false) return 'Suspended';
    return 'Active';
  };

  if (loading) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']}>
        <Header title="Agency Hub" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 12 }}>
            Loading agency data...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Agency Command Hub" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.primary + '10' }]}>
            <Building2 size={20} color={colors.primary} />
            <Text variant="h3" weight="bold" color={colors.textPrimary}>{stats?.total_clients || subClients.length}</Text>
            <Text variant="caption" color={colors.textMuted}>Clients</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.success + '10' }]}>
            <CheckCircle size={20} color={colors.success} />
            <Text variant="h3" weight="bold" color={colors.textPrimary}>{stats?.active_clients || subClients.filter(c => c.status !== 'SUSPENDED').length}</Text>
            <Text variant="caption" color={colors.textMuted}>Active</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#8B5CF6' + '10' }]}>
            <Users size={20} color="#8B5CF6" />
            <Text variant="h3" weight="bold" color={colors.textPrimary}>{stats?.total_agents || 0}</Text>
            <Text variant="caption" color={colors.textMuted}>Agents</Text>
          </Card>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search clients..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filterStatus === status ? colors.primary : colors.surface,
                  borderColor: filterStatus === status ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                variant="caption"
                weight="bold"
                color={filterStatus === status ? '#fff' : colors.textMuted}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Client List */}
        {filteredClients.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Building2 size={40} color={colors.textMuted} />
            <Text variant="body" color={colors.textMuted} style={{ marginTop: 12, textAlign: 'center' }}>
              {searchQuery ? 'No matching clients found' : 'No sub-clients yet. Create your first workspace!'}
            </Text>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={[styles.clientAvatar, { backgroundColor: colors.primary + '20' }]}>
                  <Text variant="body" weight="bold" color={colors.primary}>
                    {(client.business_name || 'C').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                    {client.business_name}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {client.email}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(client) }]}>
                  <Text variant="caption" color="#fff" style={{ fontSize: 9, fontWeight: '700' }}>
                    {getStatusLabel(client)}
                  </Text>
                </View>
              </View>

              {/* Quick Info */}
              <View style={styles.clientMeta}>
                {client.plan && (
                  <View style={[styles.metaChip, { backgroundColor: '#8B5CF6' + '15' }]}>
                    <ShieldCheck size={12} color="#8B5CF6" />
                    <Text variant="caption" color="#8B5CF6" style={{ fontWeight: '600' }}>{client.plan}</Text>
                  </View>
                )}
                {client.phone_number && (
                  <View style={[styles.metaChip, { backgroundColor: colors.surface }]}>
                    <Phone size={12} color={colors.textMuted} />
                    <Text variant="caption" color={colors.textMuted}>{client.phone_number}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.clientActions}>
                {client.status === 'SUSPENDED' || client.is_active === false ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
                    onPress={() => handleAction(client.id, 'activate')}
                  >
                    <CheckCircle size={14} color={colors.success} />
                    <Text variant="caption" weight="bold" color={colors.success}>Activate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]}
                    onPress={() =>
                      Alert.alert('Suspend Client', `Are you sure you want to suspend "${client.business_name}"?`, [
                        { text: 'Cancel' },
                        { text: 'Suspend', style: 'destructive', onPress: () => handleAction(client.id, 'suspend') },
                      ])
                    }
                  >
                    <X size={14} color={colors.error} />
                    <Text variant="caption" weight="bold" color={colors.error}>Suspend</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.warning + '15' }]}
                  onPress={() => {
                    setSelectedClient(client);
                    setNewPassword('');
                    setShowPasswordModal(true);
                  }}
                >
                  <KeyRound size={14} color={colors.warning} />
                  <Text variant="caption" weight="bold" color={colors.warning}>Reset PW</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Sub-Client Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" weight="bold" color={colors.textPrimary}>Create Sub-Client</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {[
                { key: 'business_name', label: 'Business Name', placeholder: 'Enter business name' },
                { key: 'owner_name', label: 'Owner Name', placeholder: 'Enter owner name' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com', keyboardType: 'email-address' as const },
                { key: 'phone_number', label: 'Phone', placeholder: '+91 9876543210', keyboardType: 'phone-pad' as const },
                { key: 'password', label: 'Password', placeholder: 'Initial password' },
              ].map((field) => (
                <View key={field.key} style={styles.formGroup}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.formLabel}>
                    {field.label}
                  </Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={(formState as any)[field.key]}
                    onChangeText={(text) => setFormState((prev) => ({ ...prev, [field.key]: text }))}
                    keyboardType={field.keyboardType}
                    autoCapitalize="none"
                  />
                </View>
              ))}

              {/* Plan Selector */}
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.formLabel}>
                Plan
              </Text>
              <View style={styles.planSelector}>
                {['STARTER', 'GROWTH', 'ADVANCED'].map((plan) => (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.planOption,
                      {
                        backgroundColor: formState.plan === plan ? colors.primary : colors.surface,
                        borderColor: formState.plan === plan ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFormState((prev) => ({ ...prev, plan }))}
                  >
                    <Text
                      variant="caption"
                      weight="bold"
                      color={formState.plan === plan ? '#fff' : colors.textMuted}
                    >
                      {plan}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateSubClient}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Plus size={18} color="#fff" />
                  <Text variant="body" weight="bold" color="#fff">Create Workspace</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" weight="bold" color={colors.textPrimary}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 12 }}>
              Set a new password for {selectedClient?.business_name}
            </Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.warning, marginTop: 16 }]}
              onPress={() => {
                if (!newPassword) {
                  Alert.alert('Required', 'Please enter a new password.');
                  return;
                }
                handleAction(selectedClient!.id, 'reset_password', { new_password: newPassword });
              }}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <KeyRound size={18} color="#fff" />
                  <Text variant="body" weight="bold" color="#fff">Reset Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    gap: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  clientCard: {
    marginBottom: 12,
    padding: 16,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  statusDot: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  clientMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBody: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  planSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  planOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
});
