import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { ExternalLink, ChevronRight, Share2 } from 'lucide-react-native';
import { Card } from './Card';
import { Text } from './Text';
import { useTheme } from '../theme';
import { YouTubeLogo, InstagramLogo, XLogo } from './SocialLogos';
import { APP_CONFIG } from '../config/app-config';

interface SocialChannelItem {
  id: string;
  name: string;
  handle: string;
  url: string;
  description: string;
  icon: React.ReactNode;
  badgeBg: string;
}

interface SocialChannelsCardProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const SocialChannelsCard: React.FC<SocialChannelsCardProps> = ({
  title = 'Official Social Channels',
  subtitle = 'Follow UWO Connect for updates, product releases & tutorials',
  compact = false,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const channels: SocialChannelItem[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@UWOConnect',
      url: APP_CONFIG.socialLinks.youtube,
      description: 'Tutorials, webinars & automation guides',
      icon: <YouTubeLogo size={compact ? 22 : 28} />,
      badgeBg: '#FF000015',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@uwoconnect',
      url: APP_CONFIG.socialLinks.instagram,
      description: 'Stories, updates & community reels',
      icon: <InstagramLogo size={compact ? 22 : 28} />,
      badgeBg: '#E1306C15',
    },
    {
      id: 'x',
      name: 'X (formerly Twitter)',
      handle: '@uwoconnect',
      url: APP_CONFIG.socialLinks.x,
      description: 'Real-time announcements & product news',
      icon: <XLogo size={compact ? 20 : 26} />,
      badgeBg: isDark ? '#FFFFFF15' : '#0F172A10',
    },
  ];

  const handleOpenChannel = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err: any) {
      Alert.alert('Unable to open link', `Could not open ${name}. Please check your browser or network.`);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactRow}>
        {channels.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            activeOpacity={0.7}
            onPress={() => handleOpenChannel(ch.url, ch.name)}
            style={[
              styles.compactChip,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {ch.icon}
            <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 6 }}>
              {ch.handle}
            </Text>
            <ExternalLink size={11} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.headerIconWrapper, { backgroundColor: colors.primary + '15' }]}>
          <Share2 size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.channelList}>
        {channels.map((ch, index) => {
          const isLast = index === channels.length - 1;
          return (
            <View key={ch.id}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenChannel(ch.url, ch.name)}
                style={styles.channelRow}
              >
                <View style={[styles.logoContainer, { backgroundColor: ch.badgeBg }]}>
                  {ch.icon}
                </View>
                <View style={styles.channelInfo}>
                  <View style={styles.channelNameRow}>
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      {ch.name}
                    </Text>
                    <View style={[styles.handleBadge, { backgroundColor: colors.cardHover }]}>
                      <Text style={[styles.handleBadgeText, { color: colors.textSecondary }]}>
                        {ch.handle}
                      </Text>
                    </View>
                  </View>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {ch.description}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
              {!isLast ? (
                <View style={[styles.divider, { backgroundColor: colors.borderMuted }]} />
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  handleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  handleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  compactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
});
