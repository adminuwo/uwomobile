import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from './Screen';
import { Header } from './Header';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '../theme';
import { 
  Sparkles, 
  Lock, 
  ChevronLeft, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react-native';

interface ComingSoonScreenProps {
  channelName: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  channelName,
  category = 'Channel Integration',
  description = 'This connector is currently deactivated by the platform administrator and will be available in an upcoming update.',
  icon,
}) => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Screen safeAreaEdges={['top', 'bottom']} style={{ backgroundColor: colors.background }}>
      <Header
        title={channelName}
        showBack={true}
        onBackPress={() => router.navigate('/(app)/home')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.mainCard}>
          {/* Top subtle accent */}
          <View style={styles.topAccent} />

          {/* Icon Badge */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              {icon || <Lock size={32} color="#F59E0B" />}
            </View>
            <View style={styles.sparkleBadge}>
              <Sparkles size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </View>

          {/* Title & Category */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{channelName}</Text>
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{category}</Text>

          {/* Description Box */}
          <View style={[
            styles.infoBox,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            }
          ]}>
            <View style={styles.infoRow}>
              <ShieldAlert size={18} color={isDark ? '#F59E0B' : '#D97706'} style={{ marginTop: 2, marginRight: 8 }} />
              <Text style={[styles.descriptionText, { color: isDark ? '#FDE68A' : '#92400E' }]}>{description}</Text>
            </View>
          </View>

          {/* Active channels reminder */}
          <View style={[
            styles.activeCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
            }
          ]}>
            <Text style={[styles.activeTitle, { color: isDark ? '#34D399' : '#047857' }]}>Active Channels Available Today:</Text>
            <View style={styles.channelRow}>
              <CheckCircle2 size={16} color={isDark ? '#10B981' : '#059669'} />
              <Text style={[styles.channelName, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>WhatsApp Business API (Official Meta)</Text>
            </View>
            <View style={styles.channelRow}>
              <CheckCircle2 size={16} color={isDark ? '#10B981' : '#059669'} />
              <Text style={[styles.channelName, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Instagram Direct DM Automation</Text>
            </View>
            <View style={styles.channelRow}>
              <CheckCircle2 size={16} color={isDark ? '#10B981' : '#059669'} />
              <Text style={[styles.channelName, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Facebook Messenger Pages</Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(app)/inbox')}
            activeOpacity={0.8}
          >
            <MessageSquare size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Go to Active Inbox</Text>
            <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.navigate('/(app)/home')}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Back</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#F59E0B',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
    marginTop: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 4,
  },
  badgeWrapper: {
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  activeCard: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
  },
  activeTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelName: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
