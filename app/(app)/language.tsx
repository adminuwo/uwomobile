import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { useTranslation, LanguageInfo } from '../../src/i18n';
import { Search, Check, Globe } from 'lucide-react-native';

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return supportedLanguages;
    const query = searchQuery.toLowerCase().trim();
    return supportedLanguages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [supportedLanguages, searchQuery]);

  const handleSelectLanguage = async (selectedLang: LanguageInfo) => {
    await setLanguage(selectedLang.code);
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title={t('language.title')} showBack />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderMuted,
              },
            ]}
          >
            <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('language.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Language List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
            {t('language.subtitle').toUpperCase()}
          </Text>

          <Card style={styles.listCard}>
            {filteredLanguages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Globe size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text variant="body" color={colors.textMuted}>
                  {t('language.noLanguagesFound')}
                </Text>
              </View>
            ) : (
              filteredLanguages.map((lang, index) => {
                const isSelected = language === lang.code;
                const isLast = index === filteredLanguages.length - 1;

                return (
                  <View key={lang.code}>
                    <TouchableOpacity
                      style={[
                        styles.langRow,
                        isSelected && {
                          backgroundColor: colors.primary + '10',
                        },
                      ]}
                      onPress={() => handleSelectLanguage(lang)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.flagBox}>
                        <Text style={styles.flagText}>{lang.flag || '🌐'}</Text>
                      </View>

                      <View style={styles.langInfo}>
                        <View style={styles.langNameRow}>
                          <Text
                            variant="body"
                            weight={isSelected ? 'bold' : 'medium'}
                            color={isSelected ? colors.primary : colors.textPrimary}
                          >
                            {lang.name}
                          </Text>
                          {lang.nativeName !== lang.name && (
                            <Text
                              variant="body"
                              color={isSelected ? colors.primary : colors.textMuted}
                              style={styles.nativeScript}
                            >
                              ({lang.nativeName})
                            </Text>
                          )}
                        </View>
                        <Text variant="caption" color={colors.textMuted}>
                          Code: {lang.code.toUpperCase()}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View
                          style={[
                            styles.checkBadge,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Check size={14} color="#ffffff" />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.uncheckCircle,
                            { borderColor: colors.borderMuted },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                    {!isLast && (
                      <View
                        style={[styles.divider, { backgroundColor: colors.divider }]}
                      />
                    )}
                  </View>
                );
              })
            )}
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  flagBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: 22,
  },
  langInfo: {
    flex: 1,
  },
  langNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nativeScript: {
    fontSize: 14,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
