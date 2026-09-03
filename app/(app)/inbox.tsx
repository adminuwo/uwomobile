import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import { useTheme } from '../../src/theme';
import { MessageSquare } from 'lucide-react-native';

export default function InboxScreen() {
  const { colors, spacing } = useTheme();

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Unified Inbox" />

      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search messages, numbers, or channels..." />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EmptyState
          icon={<MessageSquare size={36} color={colors.primary} />}
          title="Mobile Inbox Ready"
          description="WhatsApp, Instagram, Facebook, and Email channels will stream into your mobile inbox in Phase 2."
          actionTitle="Explore Settings"
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
