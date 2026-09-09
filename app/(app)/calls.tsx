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
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import {
  Phone,
  PhoneCall,
  Video,
  Users,
  Search,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  PhoneMissed,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  User,
  MessageSquare,
} from 'lucide-react-native';

interface TeamContact {
  id: number;
  name: string;
  email: string;
  role?: string;
  department?: string;
  status?: string;
  is_online?: boolean;
  is_in_call?: boolean;
}

interface CallHistoryEntry {
  id: number;
  contact_name: string;
  contact_email?: string;
  call_type: 'audio' | 'video';
  direction: 'outgoing' | 'incoming' | 'missed';
  duration?: number;
  started_at?: string;
  ended_at?: string;
  status?: string;
}

export default function CallsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'contacts' | 'history'>('contacts');
  const [contacts, setContacts] = useState<TeamContact[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiClient.get<any>('/api/team/members/');
      const memberList = Array.isArray(data) ? data : data?.results || [];
      const mapped: TeamContact[] = memberList.map((c: any, i: number) => ({
        id: c.id || i + 1,
        name: c.name || c.full_name || c.username || c.email || 'Team Member',
        email: c.email || c.username || '',
        role: c.role || c.designation || c.enterprise_role || 'Team Member',
        department: c.department || 'General',
        status: c.status || 'active',
        is_online: c.is_online || false,
        is_in_call: c.is_in_call || false,
      }));
      setContacts(mapped);
    } catch (err) {
      console.warn('Contacts fetch error:', err);
    }
  }, []);

  const fetchCallHistory = useCallback(async () => {
    try {
      const data = await apiClient.get<any>('/api/webrtc/history/');
      if (data?.history) {
        setCallHistory(data.history);
      }
    } catch (err) {
      console.warn('Call history fetch error:', err);
      // Provide empty state — API may not exist yet
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchContacts(), fetchCallHistory()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchContacts, fetchCallHistory]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleCall = (contact: TeamContact, isVideo: boolean) => {
    Alert.alert(
      isVideo ? 'Start Video Call' : 'Start Voice Call',
      `Calling ${contact.name}...\n\nWebRTC calling requires a browser-based signaling server. For the best experience, use the web dashboard for Voice & Video calls.\n\nThis feature will be enhanced in a future update with native calling support.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open on Web',
          onPress: () => {
            Alert.alert('Info', 'Please open the web dashboard and navigate to Voice & Video Calls to start a call.');
          },
        },
      ]
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'missed') return <PhoneMissed size={16} color={colors.error} />;
    if (direction === 'outgoing') return <ArrowUpRight size={16} color={colors.success} />;
    return <ArrowDownLeft size={16} color={colors.primary} />;
  };

  const filteredContacts = contacts.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']}>
        <Header title="Voice & Video Calls" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 12 }}>
            Loading team directory...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Voice & Video Calls" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Banner */}
        <Card style={[styles.heroBanner, { backgroundColor: '#00AB56' + '15', borderColor: '#00AB56' + '30' }]}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIconBox, { backgroundColor: '#00AB56' }]}>
              <PhoneCall size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                Enterprise Calling
              </Text>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                Call your team members directly. WebRTC-powered voice & video.
              </Text>
            </View>
          </View>
        </Card>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contacts' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('contacts')}
          >
            <Users size={16} color={activeTab === 'contacts' ? '#fff' : colors.textMuted} />
            <Text
              variant="body"
              weight="bold"
              color={activeTab === 'contacts' ? '#fff' : colors.textMuted}
            >
              Contacts ({contacts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('history')}
          >
            <Clock size={16} color={activeTab === 'history' ? '#fff' : colors.textMuted} />
            <Text
              variant="body"
              weight="bold"
              color={activeTab === 'history' ? '#fff' : colors.textMuted}
            >
              History ({callHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'contacts' ? (
          <>
            {/* Search */}
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search team members..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Contact List */}
            {filteredContacts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Users size={40} color={colors.textMuted} />
                <Text variant="body" color={colors.textMuted} style={{ marginTop: 12, textAlign: 'center' }}>
                  {searchQuery ? 'No matching contacts' : 'No team members found'}
                </Text>
              </Card>
            ) : (
              filteredContacts.map((contact) => {
                const initials = (contact.name || 'TM')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                const avatarColors = ['#3B82F6', '#10B981', '#8B5CF6', '#14B8A6', '#F97316', '#6366F1'];
                const bgColor = avatarColors[contact.id % avatarColors.length];

                return (
                  <Card key={contact.id} style={styles.contactCard}>
                    <View style={styles.contactRow}>
                      <View style={[styles.contactAvatar, { backgroundColor: bgColor + '20' }]}>
                        <Text variant="body" weight="bold" color={bgColor}>
                          {initials}
                        </Text>
                        {contact.is_online && (
                          <View style={[styles.onlineDot, { borderColor: colors.background }]} />
                        )}
                      </View>
                      <View style={styles.contactInfo}>
                        <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                          {contact.name}
                        </Text>
                        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                          {contact.role} {contact.department ? `· ${contact.department}` : ''}
                        </Text>
                      </View>
                      {/* Call Actions */}
                      <TouchableOpacity
                        style={[styles.callBtn, { backgroundColor: '#00AB56' + '15' }]}
                        onPress={() => handleCall(contact, false)}
                      >
                        <Phone size={18} color="#00AB56" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.callBtn, { backgroundColor: colors.primary + '15' }]}
                        onPress={() => handleCall(contact, true)}
                      >
                        <Video size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Call History */}
            {callHistory.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Clock size={40} color={colors.textMuted} />
                <Text variant="body" color={colors.textMuted} style={{ marginTop: 12, textAlign: 'center' }}>
                  No call history yet
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4, textAlign: 'center' }}>
                  Your call logs will appear here once you make or receive calls from the web dashboard.
                </Text>
              </Card>
            ) : (
              callHistory.map((entry) => (
                <Card key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    {getDirectionIcon(entry.direction)}
                    <View style={styles.historyInfo}>
                      <Text variant="body" weight="medium" color={colors.textPrimary}>
                        {entry.contact_name}
                      </Text>
                      <View style={styles.historyMeta}>
                        {entry.call_type === 'video' ? (
                          <Video size={12} color={colors.textMuted} />
                        ) : (
                          <Phone size={12} color={colors.textMuted} />
                        )}
                        <Text variant="caption" color={colors.textMuted}>
                          {entry.call_type === 'video' ? 'Video' : 'Voice'} · {formatDuration(entry.duration)}
                        </Text>
                      </View>
                    </View>
                    <Text variant="caption" color={colors.textMuted}>
                      {formatTime(entry.started_at)}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* Info Banner */}
        <Card style={[styles.infoCard, { backgroundColor: colors.info + '10', borderColor: colors.info + '30' }]}>
          <View style={styles.infoRow}>
            <MessageSquare size={16} color={colors.info} />
            <Text variant="caption" color={colors.textMuted} style={styles.infoText}>
              Native in-app calling with WebRTC is under development. Currently, use the web dashboard for the full voice & video calling experience with screen sharing.
            </Text>
          </View>
        </Card>
      </ScrollView>
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
  heroBanner: {
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  contactCard: {
    marginBottom: 8,
    padding: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  contactInfo: {
    flex: 1,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: {
    marginBottom: 8,
    padding: 14,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  infoCard: {
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
