import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme, THEME_PRESETS, ThemeMode } from '../../src/theme';
import { useTranslation } from '../../src/i18n';
import {
  Sun,
  Moon,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react-native';

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export default function AppearanceScreen() {
  const {
    colors,
    mode,
    primaryColor,
    accentColor,
    customBase,
    setThemeMode,
    setCustomTheme,
    resetTheme,
  } = useTheme();
  const { t } = useTranslation();

  // Local draft state for custom theme editing
  const [draftPrimary, setDraftPrimary] = useState<string>(primaryColor || '#059669');
  const [draftAccent, setDraftAccent] = useState<string>(accentColor || '#0d9488');
  const [draftBase, setDraftBase] = useState<'light' | 'dark'>(customBase || 'light');
  const [isApplying, setIsApplying] = useState(false);

  const handleSelectMode = async (selectedMode: ThemeMode) => {
    if (selectedMode === 'custom') {
      await setCustomTheme(draftPrimary, draftAccent, draftBase);
    } else {
      await setThemeMode(selectedMode);
    }
  };

  const handleSelectPreset = (preset: typeof THEME_PRESETS[0]) => {
    setDraftPrimary(preset.primary);
    setDraftAccent(preset.accent);
    if (mode === 'custom') {
      setCustomTheme(preset.primary, preset.accent, draftBase);
    }
  };

  const handleApplyCustom = async () => {
    if (!HEX_REGEX.test(draftPrimary)) {
      Alert.alert(t('common.error'), 'Please enter a valid Hex primary color (e.g. #059669)');
      return;
    }
    if (!HEX_REGEX.test(draftAccent)) {
      Alert.alert(t('common.error'), 'Please enter a valid Hex accent color (e.g. #0d9488)');
      return;
    }

    setIsApplying(true);
    try {
      await setCustomTheme(draftPrimary, draftAccent, draftBase);
      Alert.alert(t('common.success'), t('appearance.themeApplied'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleResetDefault = async () => {
    setDraftPrimary('#059669');
    setDraftAccent('#0d9488');
    setDraftBase('light');
    await resetTheme();
    Alert.alert(t('common.success'), t('appearance.resetDefault'));
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title={t('appearance.title')} showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
          {t('appearance.modeTitle').toUpperCase()}
        </Text>

        {/* Mode Selector Cards */}
        <View style={styles.modeContainer}>
          {/* Light Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.surface,
                borderColor: mode === 'light' ? colors.primary : colors.borderMuted,
                borderWidth: mode === 'light' ? 2 : 1,
              },
            ]}
            onPress={() => handleSelectMode('light')}
            activeOpacity={0.8}
          >
            <View style={styles.modeCardHeader}>
              <View style={[styles.modeIconBox, { backgroundColor: '#fef3c7' }]}>
                <Sun size={22} color="#d97706" />
              </View>
              {mode === 'light' && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Check size={14} color="#ffffff" />
                </View>
              )}
            </View>
            <Text variant="body" weight="bold" color={colors.textPrimary} style={styles.modeTitle}>
              {t('appearance.light')}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {t('appearance.lightDesc')}
            </Text>
          </TouchableOpacity>

          {/* Dark Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.surface,
                borderColor: mode === 'dark' ? colors.primary : colors.borderMuted,
                borderWidth: mode === 'dark' ? 2 : 1,
              },
            ]}
            onPress={() => handleSelectMode('dark')}
            activeOpacity={0.8}
          >
            <View style={styles.modeCardHeader}>
              <View style={[styles.modeIconBox, { backgroundColor: '#1e293b' }]}>
                <Moon size={22} color="#38bdf8" />
              </View>
              {mode === 'dark' && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Check size={14} color="#ffffff" />
                </View>
              )}
            </View>
            <Text variant="body" weight="bold" color={colors.textPrimary} style={styles.modeTitle}>
              {t('appearance.dark')}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {t('appearance.darkDesc')}
            </Text>
          </TouchableOpacity>

          {/* Custom Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.surface,
                borderColor: mode === 'custom' ? colors.primary : colors.borderMuted,
                borderWidth: mode === 'custom' ? 2 : 1,
              },
            ]}
            onPress={() => handleSelectMode('custom')}
            activeOpacity={0.8}
          >
            <View style={styles.modeCardHeader}>
              <View style={[styles.modeIconBox, { backgroundColor: `${draftPrimary}20` }]}>
                <Sparkles size={22} color={draftPrimary} />
              </View>
              {mode === 'custom' && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Check size={14} color="#ffffff" />
                </View>
              )}
            </View>
            <Text variant="body" weight="bold" color={colors.textPrimary} style={styles.modeTitle}>
              {t('appearance.custom')}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {t('appearance.customDesc')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Theme Section */}
        {mode === 'custom' && (
          <View style={styles.customSection}>
            {/* Base Surface Option (Light / Dark) */}
            <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
              {t('appearance.surfaceStyle').toUpperCase()}
            </Text>
            <Card style={styles.baseSelectorCard}>
              <View style={styles.baseSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.baseOption,
                    draftBase === 'light' && {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setDraftBase('light');
                    setCustomTheme(draftPrimary, draftAccent, 'light');
                  }}
                >
                  <Sun size={18} color={draftBase === 'light' ? colors.primary : colors.textMuted} />
                  <Text
                    variant="body"
                    weight="medium"
                    color={draftBase === 'light' ? colors.primary : colors.textPrimary}
                    style={{ marginLeft: 8 }}
                  >
                    {t('appearance.lightSurface')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.baseOption,
                    draftBase === 'dark' && {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setDraftBase('dark');
                    setCustomTheme(draftPrimary, draftAccent, 'dark');
                  }}
                >
                  <Moon size={18} color={draftBase === 'dark' ? colors.primary : colors.textMuted} />
                  <Text
                    variant="body"
                    weight="medium"
                    color={draftBase === 'dark' ? colors.primary : colors.textPrimary}
                    style={{ marginLeft: 8 }}
                  >
                    {t('appearance.darkSurface')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Presets Palette */}
            <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
              {t('appearance.presetsTitle').toUpperCase()}
            </Text>
            <Card style={styles.presetsCard}>
              <View style={styles.presetsGrid}>
                {THEME_PRESETS.map((preset) => {
                  const isSelected =
                    draftPrimary.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={styles.presetItem}
                      onPress={() => handleSelectPreset(preset)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.presetCircle,
                          { backgroundColor: preset.primary },
                          isSelected && {
                            borderColor: colors.textPrimary,
                            borderWidth: 3,
                            transform: [{ scale: 1.1 }],
                          },
                        ]}
                      >
                        {isSelected && <Check size={16} color="#ffffff" />}
                      </View>
                      <Text
                        variant="caption"
                        color={isSelected ? colors.textPrimary : colors.textMuted}
                        weight={isSelected ? 'bold' : 'regular'}
                        style={styles.presetLabel}
                      >
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Custom Hex Inputs */}
            <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
              {t('appearance.customColorTitle').toUpperCase()}
            </Text>
            <Card style={styles.hexInputsCard}>
              <View style={styles.hexRow}>
                <View style={styles.hexInputWrapper}>
                  <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    {t('appearance.primaryColor')}
                  </Text>
                  <View style={styles.hexInputBox}>
                    <View
                      style={[styles.colorPreviewSwatch, { backgroundColor: draftPrimary }]}
                    />
                    <TextInput
                      style={[
                        styles.hexTextInput,
                        { color: colors.textPrimary, borderColor: colors.borderMuted },
                      ]}
                      value={draftPrimary}
                      onChangeText={(val) => setDraftPrimary(val.startsWith('#') ? val : '#' + val)}
                      placeholder="#059669"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      maxLength={7}
                    />
                  </View>
                </View>

                <View style={styles.hexInputWrapper}>
                  <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    {t('appearance.accentColor')}
                  </Text>
                  <View style={styles.hexInputBox}>
                    <View
                      style={[styles.colorPreviewSwatch, { backgroundColor: draftAccent }]}
                    />
                    <TextInput
                      style={[
                        styles.hexTextInput,
                        { color: colors.textPrimary, borderColor: colors.borderMuted },
                      ]}
                      value={draftAccent}
                      onChangeText={(val) => setDraftAccent(val.startsWith('#') ? val : '#' + val)}
                      placeholder="#0d9488"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      maxLength={7}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.actionButtonsRow}>
                <Button
                  title={t('appearance.applyTheme')}
                  onPress={handleApplyCustom}
                  loading={isApplying}
                  style={styles.applyBtn}
                />
              </View>
            </Card>
          </View>
        )}

        {/* Live Interactive Preview */}
        <Text variant="caption" color={colors.textMuted} style={styles.sectionHeader}>
          {t('appearance.livePreview').toUpperCase()}
        </Text>
        <Card
          style={[
            styles.previewCard,
            {
              backgroundColor:
                mode === 'custom'
                  ? draftBase === 'dark'
                    ? '#16271c'
                    : '#ffffff'
                  : colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.previewHeaderRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    (mode === 'custom' ? draftPrimary : colors.primary) + '20',
                },
              ]}
            >
              <Text
                variant="caption"
                weight="bold"
                color={mode === 'custom' ? draftPrimary : colors.primary}
              >
                {t('appearance.previewBadge')}
              </Text>
            </View>
            <Sliders
              size={18}
              color={mode === 'custom' ? draftAccent : colors.secondary}
            />
          </View>

          <Text
            variant="h3"
            weight="bold"
            color={
              mode === 'custom' && draftBase === 'dark'
                ? '#ffffff'
                : mode === 'dark'
                ? '#ffffff'
                : '#0f172a'
            }
            style={styles.previewTitle}
          >
            {t('appearance.previewCardTitle')}
          </Text>

          <Text
            variant="body"
            color={
              mode === 'custom' && draftBase === 'dark'
                ? '#a1a1aa'
                : mode === 'dark'
                ? '#a1a1aa'
                : '#64748b'
            }
            style={styles.previewDescription}
          >
            {t('appearance.previewCardSubtitle')}
          </Text>

          <View style={styles.previewButtonsRow}>
            <TouchableOpacity
              style={[
                styles.previewButtonPrimary,
                {
                  backgroundColor:
                    mode === 'custom' ? draftPrimary : colors.primary,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text variant="body" weight="bold" color="#ffffff">
                {t('appearance.previewButtonPrimary')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButtonSecondary,
                {
                  borderColor:
                    mode === 'custom' ? draftAccent : colors.secondary,
                  backgroundColor:
                    (mode === 'custom' ? draftAccent : colors.secondary) + '15',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                weight="medium"
                color={mode === 'custom' ? draftAccent : colors.secondary}
              >
                {t('appearance.previewButtonSecondary')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Reset to Default Button */}
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.borderMuted }]}
          onPress={handleResetDefault}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <Text variant="body" color={colors.textMuted}>
            {t('appearance.resetDefault')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 16,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  modeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    marginTop: 12,
    marginBottom: 4,
  },
  customSection: {
    marginTop: 8,
  },
  baseSelectorCard: {
    padding: 8,
  },
  baseSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  baseOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetsCard: {
    padding: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  presetItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 8,
  },
  presetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  presetLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  hexInputsCard: {
    padding: 16,
  },
  hexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hexInputWrapper: {
    flex: 1,
  },
  hexInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreviewSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  hexTextInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  actionButtonsRow: {
    marginTop: 16,
  },
  applyBtn: {
    width: '100%',
  },
  previewCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewTitle: {
    marginBottom: 6,
  },
  previewDescription: {
    lineHeight: 20,
    marginBottom: 16,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewButtonPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonSecondary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
