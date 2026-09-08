import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { SearchBar } from '../../src/components/SearchBar';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import { BookOpen, ExternalLink, Sparkles, ChevronRight, Clock } from 'lucide-react-native';

export interface Guide {
  id: string;
  title: string;
  description: string;
  category?: string;
  read_time?: string;
  url?: string;
  slug?: string;
}

export default function GuidesScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { data: rawGuides, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/api/guides/');
      if (Array.isArray(res)) return res;
      return res?.results || [];
    }
  });

  const guidesList: Guide[] = Array.isArray(rawGuides) ? rawGuides : [];

  const categories = ['ALL', 'Integrations', 'Marketing', 'Automation', 'Sales', 'Communication', 'AI & Training'];

  const filteredGuides = useMemo(() => {
    return guidesList.filter((g) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        (g.category || '').toUpperCase() === selectedCategory.toUpperCase();
      const matchesSearch =
        !searchQuery ||
        (g.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [guidesList, selectedCategory, searchQuery]);

  const handleOpenGuide = (guide: Guide) => {
    if (guide.url) {
      Linking.openURL(guide.url);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Learning Center & Guides" showMenu={true} />

      {/* Banner */}
      <View style={styles.bannerWrap}>
        <Card style={[styles.bannerCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIconBox, { backgroundColor: colors.primary }]}>
              <BookOpen size={20} color="#FFFFFF" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text variant="body" weight="bold" color={colors.primary}>
                UWO Connect Academy & Guides
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Step-by-step documentation, automation tips, and platform walkthroughs.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search guides, tutorials, or setup steps..."
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text color={colors.error}>Failed to load learning guides.</Text>
        </View>
      ) : filteredGuides.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text variant="h3" color={colors.textPrimary}>No Guides Found</Text>
          <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
            Try adjusting your search query or category filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGuides}
          keyExtractor={(item) => String(item.id || item.slug || item.title)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }: { item: Guide }) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleOpenGuide(item)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.content}>
                    <View style={styles.tagRow}>
                      <View style={[styles.categoryPill, { backgroundColor: `${colors.primary}15` }]}>
                        <Text variant="caption" weight="bold" color={colors.primary} style={{ fontSize: 10 }}>
                          {item.category || 'General'}
                        </Text>
                      </View>
                      {item.read_time ? (
                        <View style={styles.timeRow}>
                          <Clock size={10} color={colors.textMuted} />
                          <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginLeft: 2 }}>
                            {item.read_time}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text variant="h3" weight="bold" style={{ marginTop: 6 }}>
                      {item.title}
                    </Text>
                    <Text variant="body" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: 4 }}>
                      {item.description}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={colors.textMuted} style={{ marginTop: 12 }} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bannerCard: {
    padding: 14,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  chipsContainer: {
    paddingVertical: 8,
  },
  chipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
