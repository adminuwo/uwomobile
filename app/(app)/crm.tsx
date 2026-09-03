import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Modal } from '../../src/components/Modal';
import { Input } from '../../src/components/Input';
import { LeadCard } from '../../src/components/crm/LeadCard';
import { PipelineView } from '../../src/components/crm/PipelineView';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { crmApi, Contact, LeadStage } from '../../src/api/crm';
import { colors } from '../../src/theme/colors';
import { Users, LayoutGrid, List, Plus } from 'lucide-react-native';

export default function CRMScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Lead Modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const loadContacts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await crmApi.getContacts({ search: searchQuery, limit: 100 });
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load CRM leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSelectLead = (contact: Contact) => {
    router.push({
      pathname: '/(app)/lead/[id]' as any,
      params: { id: contact.id },
    });
  };

  const handleOpenChat = (contact: Contact) => {
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

  const handleCreateLead = async () => {
    if (!newName.trim() || creating) return;

    try {
      setCreating(true);
      await crmApi.createContact({
        name: newName.trim(),
        phone_number: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined,
        stage: 'NEW',
      });

      setAddModalVisible(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      loadContacts(true);
    } catch (err) {
      console.warn('Failed to create lead:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="CRM Pipeline"
        rightElement={
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Lead</Text>
          </TouchableOpacity>
        }
      />

      {/* Controls Bar: Search & View Toggle */}
      <View style={styles.controlsBar}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search leads, phone, or email..."
          />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.toggleBtn, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? '#FFFFFF' : colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.toggleBtn, viewMode === 'pipeline' && styles.activeToggle]}
            onPress={() => setViewMode('pipeline')}
          >
            <LayoutGrid size={16} color={viewMode === 'pipeline' ? '#FFFFFF' : colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      {error && contacts.length === 0 ? (
        <ErrorState message={error} onRetry={() => loadContacts(true)} />
      ) : viewMode === 'pipeline' ? (
        <PipelineView
          contacts={contacts}
          onSelectLead={handleSelectLead}
          onOpenChat={handleOpenChat}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard contact={item} onPress={handleSelectLead} onOpenChat={handleOpenChat} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadContacts(true)} tintColor="#10B981" />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon={Users}
                title="No CRM Leads Found"
                description="Click 'Add Lead' above to create your first customer lead."
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Lead Modal */}
      <Modal
        visible={addModalVisible}
        title="Add New CRM Lead"
        onClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={newName}
            onChangeText={setNewName}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +919876543210"
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <Input
            label="Email Address"
            placeholder="e.g. rahul@example.com"
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <Button title="Create Lead" loading={creating} onPress={handleCreateLead} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: colors.primary.main,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  modalBody: {
    gap: 12,
  },
});
