import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { LeadStageBadge } from './LeadStageBadge';
import { Contact } from '../../api/crm';
import { colors } from '../../theme/colors';
import { Phone, Mail, MessageSquare, ChevronRight } from 'lucide-react-native';

interface LeadCardProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
  onOpenChat?: (contact: Contact) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ contact, onPress, onOpenChat }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={() => onPress(contact)}>
      <View style={styles.headerRow}>
        <Avatar name={contact.name || contact.phone_number || 'Lead'} size="md" />

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {contact.name || 'Unnamed Lead'}
          </Text>
          {contact.phone_number ? (
            <View style={styles.iconText}>
              <Phone size={12} color={colors.text.muted} />
              <Text style={styles.subText}>{contact.phone_number}</Text>
            </View>
          ) : null}
          {contact.email ? (
            <View style={styles.iconText}>
              <Mail size={12} color={colors.text.muted} />
              <Text numberOfLines={1} style={styles.subText}>
                {contact.email}
              </Text>
            </View>
          ) : null}
        </View>

        <ChevronRight size={18} color={colors.text.muted} />
      </View>

      <View style={styles.footerRow}>
        <LeadStageBadge stage={contact.stage} size="sm" />

        {onOpenChat && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.chatButton}
            onPress={(e) => {
              e.stopPropagation();
              onOpenChat(contact);
            }}
          >
            <MessageSquare size={14} color={colors.primary.main} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
  },
});
