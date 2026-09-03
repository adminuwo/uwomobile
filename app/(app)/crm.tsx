import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import { useTheme } from '../../src/theme';
import { Users } from 'lucide-react-native';

export default function CRMScreen() {
  const { colors } = useTheme();

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="CRM Contacts" />

      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search leads, clients, or tags..." />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EmptyState
          icon={<Users size={36} color={colors.secondary} />}
          title="CRM Pipeline Ready"
          description="Manage client contacts, deal stages, and custom tags directly from your phone in upcoming phases."
          actionTitle="View Overview"
          onAction={() => {}}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});
