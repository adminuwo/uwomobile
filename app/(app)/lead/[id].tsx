import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Header } from '../../../src/components/Header';
import { Avatar } from '../../../src/components/Avatar';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { LeadStageBadge } from '../../../src/components/crm/LeadStageBadge';
import { crmApi, Contact, LeadStage } from '../../../src/api/crm';
import { colors } from '../../../src/theme/colors';
import { Phone, Mail, MessageSquare, Calendar, Tag, FileText, ArrowLeft, Save } from 'lucide-react-native';

const STAGES: { id: LeadStage; label: string }[] = [
  { id: 'NEW', label: 'New' },
  { id: 'FOLLOWUP', label: 'Follow Up' },
  { id: 'NEGOTIATION', label: 'Negotiation' },
  { id: 'WON', label: 'Won' },
  { id: 'LOST', label: 'Lost' },
];

export default function LeadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await crmApi.getContactById(id);
      if (data) {
        setContact(data);
        setNotes(data.notes || '');
      }
    } catch (err) {
      console.warn('Error fetching lead detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleStageChange = async (newStage: LeadStage) => {
    if (!contact || updatingStage || contact.stage === newStage) return;

    // Optimistic UI update
    setContact((prev) => (prev ? { ...prev, stage: newStage } : null));

    try {
      setUpdatingStage(true);
      await crmApi.updateContactStage(contact.id, newStage);
    } catch (err) {
      console.warn('Failed to update stage:', err);
      fetchContact();
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!contact || savingNotes) return;

    try {
      setSavingNotes(true);
      await crmApi.updateContact(contact.id, { notes: notes.trim() });
      fetchContact();
    } catch (err) {
      console.warn('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleOpenChat = () => {
    if (!contact) return;
    const rawAddress = contact.platform_id || contact.phone_number || contact.id;
    router.push({
      pathname: '/(app)/conversation/[id]' as any,
      params: {
        id: contact.id,
        rawAddress: rawAddress,
        name: contact.name || contact.phone_number || 'Customer',
        channel: contact.preferred_channel || 'WHATSAPP',
      },
    });
  };

  if (loading || !contact) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']}>
        <Header title="Lead Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      <Header title="Lead Profile" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Avatar name={contact.name || contact.phone_number || 'Lead'} size="lg" />
          <Text style={styles.name}>{contact.name || 'Unnamed Lead'}</Text>
          <LeadStageBadge stage={contact.stage} size="md" />

          <Button
            title="Open Conversation"
            icon={<MessageSquare size={16} color="#FFFFFF" />}
            onPress={handleOpenChat}
            style={styles.chatButton}
          />
        </Card>

        {/* Stage Selector Card */}
        <Card title="Pipeline Stage">
          <View style={styles.stageGrid}>
            {STAGES.map((st) => {
              const isSelected = contact.stage === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  activeOpacity={0.7}
                  disabled={updatingStage}
                  style={[styles.stageChip, isSelected && styles.selectedStageChip]}
                  onPress={() => handleStageChange(st.id)}
                >
                  <Text style={[styles.stageChipText, isSelected && styles.selectedStageText]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Contact Info Card */}
        <Card title="Contact Information">
          <View style={styles.infoRow}>
            <Phone size={16} color={colors.text.muted} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{contact.phone_number || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Mail size={16} color={colors.text.muted} />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{contact.email || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.text.muted} />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(contact.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Card>

        {/* Lead Notes Card */}
        <Card title="Notes & Remarks">
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add internal notes about this lead..."
            multiline
            numberOfLines={4}
          />
          <Button
            title="Save Notes"
            variant="outline"
            loading={savingNotes}
            icon={<Save size={16} color={colors.primary.main} />}
            onPress={handleSaveNotes}
            style={styles.saveNotesBtn}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chatButton: {
    marginTop: 8,
    width: '100%',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  stageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectedStageChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  stageChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  selectedStageText: {
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text.muted,
    width: 60,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  saveNotesBtn: {
    marginTop: 8,
  },
});
