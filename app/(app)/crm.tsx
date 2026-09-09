import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Modal } from '../../src/components/Modal';
import { Input } from '../../src/components/Input';
import { LeadCard } from '../../src/components/crm/LeadCard';
import { PipelineView } from '../../src/components/crm/PipelineView';
import { ImportLeadsModal } from '../../src/components/crm/ImportLeadsModal';
import { ExportLeadsModal } from '../../src/components/crm/ExportLeadsModal';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { crmApi, Contact, LeadStage } from '../../src/api/crm';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useTheme } from '../../src/theme';
import { useTranslation } from '../../src/i18n';
import { Users, LayoutGrid, List, Plus, Upload, Download } from 'lucide-react-native';

export default function CRMScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const authStatus = useSessionStore((state) => state.status);
  const token = useSessionStore((state) => state.token);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add & Import/Export Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

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
        title={t('crm.title')}
        rightElement={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.actionIconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setImportModalVisible(true)}
            >
              <Upload size={14} color={colors.textPrimary} />
              <Text style={[styles.actionIconText, { color: colors.textPrimary }]}>{t('crm.import')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.actionIconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setExportModalVisible(true)}
            >
              <Download size={14} color={colors.textPrimary} />
              <Text style={[styles.actionIconText, { color: colors.textPrimary }]}>{t('crm.export')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setAddModalVisible(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t('crm.addLead')}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Controls Bar: Search & View Toggle */}
      <View style={styles.controlsBar}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('crm.searchPlaceholder')}
          />
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? '#FFFFFF' : colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.toggleBtn, viewMode === 'pipeline' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('pipeline')}
          >
            <LayoutGrid size={16} color={viewMode === 'pipeline' ? '#FFFFFF' : colors.textMuted} />
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
          style={{ flex: 1 }}
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard contact={item} onPress={handleSelectLead} onOpenChat={handleOpenChat} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadContacts(true)} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon={Users}
                title={t('crm.noLeadsTitle')}
                description={t('crm.noLeadsDesc')}
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Lead Modal */}
      <Modal
        visible={addModalVisible}
        title={t('crm.addNewLead')}
        onClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <Input
            label={t('crm.fullName')}
            placeholder={t('crm.fullNamePlaceholder')}
            value={newName}
            onChangeText={setNewName}
          />
          <Input
            label={t('crm.phoneNumber')}
            placeholder={t('crm.phonePlaceholder')}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <Input
            label={t('crm.emailAddress')}
            placeholder={t('crm.emailPlaceholder')}
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <Button title={t('crm.createLead')} loading={creating} onPress={handleCreateLead} />
        </View>
      </Modal>

      {/* Import Leads Modal */}
      <ImportLeadsModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onSuccess={() => loadContacts(true)}
      />

      {/* Export Leads Modal */}
      <ExportLeadsModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        contacts={contacts}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionIconText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  modalBody: {
    gap: 12,
  },
});
