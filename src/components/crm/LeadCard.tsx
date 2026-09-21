import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { LeadStageBadge } from './LeadStageBadge';
import { Contact } from '../../api/crm';
import { resolveChannel } from '../../api/inbox';
import { ChannelBadge, getChannelColor } from '../inbox/ChannelBadge';
import { useTheme } from '../../theme';
import { Phone, Mail, MessageSquare, ChevronRight, Calendar, Tag } from 'lucide-react-native';

interface LeadCardProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
  onOpenChat?: (contact: Contact) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ contact, onPress, onOpenChat }) => {
  const { colors, mode } = useTheme();

  const channel = resolveChannel(
    contact.preferred_channel,
    contact.name,
    contact.platform_id || contact.phone_number
  );
  const channelColor = getChannelColor(channel);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      delayPressIn={80}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(contact)}
    >
      <View style={styles.headerRow}>
        <Avatar
          name={contact.name || contact.phone_number || 'Lead'}
          size="md"
          textColor={channelColor}
          bgColor={`${channelColor}14`}
        />

        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
            {contact.name || 'Unnamed Lead'}
          </Text>
          {contact.phone_number ? (
            <View style={styles.iconText}>
              <Phone size={12} color={colors.textMuted} />
              <Text style={[styles.subText, { color: colors.textMuted }]}>{contact.phone_number}</Text>
            </View>
          ) : null}
          {contact.email ? (
            <View style={styles.iconText}>
              <Mail size={12} color={colors.textMuted} />
              <Text numberOfLines={1} style={[styles.subText, { color: colors.textMuted }]}>
                {contact.email}
              </Text>
            </View>
          ) : null}
        </View>

        <ChevronRight size={18} color={colors.textMuted} />
      </View>

      {/* Tags Row (Rendered separately to avoid overlapping with action buttons) */}
      {Array.isArray(contact.tags) && contact.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {contact.tags.slice(0, 2).map((t, i) => (
            <View
              key={i}
              style={[
                styles.tagPill,
                {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                  borderColor: colors.border,
                },
              ]}
            >
              <Tag size={10} color={colors.textMuted} />
              <Text numberOfLines={1} style={[styles.tagText, { color: colors.textSecondary }]}>
                {t}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.footerRow, { borderTopColor: colors.borderMuted || colors.border }]}>
        <View style={styles.badgeAndTags}>
          <LeadStageBadge stage={contact.stage} size="sm" />
          <ChannelBadge channel={channel} size="sm" />
          {Boolean(contact.follow_ups_count && contact.follow_ups_count > 0) && (
            <View style={[styles.followUpBadge, { backgroundColor: '#F59E0B18', borderColor: '#F59E0B55' }]}>
              <Calendar size={11} color="#D97706" />
              <Text style={styles.followUpBadgeText}>
                {contact.next_followup_at
                  ? new Date(contact.next_followup_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : `${contact.follow_ups_count} task${(contact.follow_ups_count ?? 0) > 1 ? 's' : ''}`}
              </Text>
            </View>
          )}
        </View>

        {onOpenChat && (
          <TouchableOpacity
            activeOpacity={0.7}
            delayPressIn={80}
            style={[styles.chatButton, { backgroundColor: `${channelColor}18` }]}
            onPress={(e) => {
              e?.stopPropagation?.();
              onOpenChat(contact);
            }}
          >
            <MessageSquare size={14} color={channelColor} />
            <Text style={[styles.chatButtonText, { color: channelColor }]}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subText: {
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  chatButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeAndTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
    overflow: 'hidden',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 220,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  followUpBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
});
