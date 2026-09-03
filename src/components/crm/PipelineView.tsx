import React from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Text } from '../Text';
import { LeadCard } from './LeadCard';
import { LeadStageBadge } from './LeadStageBadge';
import { Contact, LeadStage } from '../../api/crm';
import { colors } from '../../theme/colors';

interface PipelineViewProps {
  contacts: Contact[];
  onSelectLead: (contact: Contact) => void;
  onOpenChat?: (contact: Contact) => void;
}

const STAGES: { id: LeadStage; title: string }[] = [
  { id: 'NEW', title: 'New Lead' },
  { id: 'FOLLOWUP', title: 'Follow Up' },
  { id: 'NEGOTIATION', title: 'Negotiation' },
  { id: 'WON', title: 'Closed Won' },
  { id: 'LOST', title: 'Closed Lost' },
];

export const PipelineView: React.FC<PipelineViewProps> = ({ contacts, onSelectLead, onOpenChat }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {STAGES.map((st) => {
        const stageContacts = contacts.filter((c) => (c.stage || 'NEW').toUpperCase() === st.id);

        return (
          <View key={st.id} style={styles.column}>
            <View style={styles.columnHeader}>
              <LeadStageBadge stage={st.id} size="md" />
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{stageContacts.length}</Text>
              </View>
            </View>

            <FlatList
              data={stageContacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LeadCard contact={item} onPress={onSelectLead} onOpenChat={onOpenChat} />
              )}
              contentContainerStyle={styles.columnContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  column: {
    width: 280,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: colors.surface.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  columnContent: {
    gap: 8,
  },
});
