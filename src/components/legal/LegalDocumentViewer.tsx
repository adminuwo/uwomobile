import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Card } from '../Card';
import {
  ArrowLeft,
  Search,
  X,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react-native';
import { LegalDocument, THIRD_PARTY_PROVIDERS } from '../../constants/legal';

interface LegalDocumentViewerProps {
  document: LegalDocument;
  onBack?: () => void;
  showThirdPartyTable?: boolean;
}

export const LegalDocumentViewer: React.FC<LegalDocumentViewerProps> = ({
  document,
  onBack,
  showThirdPartyTable = false,
}) => {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [tocExpanded, setTocExpanded] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, number>>({});

  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${document.title} - UWO Connect`,
        message: `${document.title} for UWO Connect (Version ${document.version}, Effective ${document.effectiveDate}).`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const scrollToSection = (sectionId: string) => {
    const yOffset = sectionLayouts[sectionId];
    if (yOffset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(0, yOffset - 20), animated: true });
      setTocExpanded(false);
    }
  };

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return document.sections;

    return document.sections.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchContent = sec.content.some((para) => para.toLowerCase().includes(q));
      return matchTitle || matchContent;
    });
  }, [document.sections, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
              {document.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.versionBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.versionText, { color: colors.primary }]}>
                  v{document.version}
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted} style={styles.updatedText}>
                Updated {document.lastUpdated}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.actionBtn} activeOpacity={0.7}>
            <Share2 size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.borderMuted }]}>
          <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={`Search within ${document.title.toLowerCase()}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Table of Contents Toggle */}
        <TouchableOpacity
          style={[styles.tocToggle, { borderTopColor: colors.borderMuted }]}
          onPress={() => setTocExpanded(!tocExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.tocToggleLeft}>
            <ListFilter size={15} color={colors.primary} />
            <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 6 }}>
              Table of Contents ({document.sections.length} Sections)
            </Text>
          </View>
          {tocExpanded ? (
            <ChevronUp size={16} color={colors.textMuted} />
          ) : (
            <ChevronDown size={16} color={colors.textMuted} />
          )}
        </TouchableOpacity>

        {/* Expandable TOC */}
        {tocExpanded && (
          <ScrollView style={[styles.tocContainer, { backgroundColor: colors.card, borderColor: colors.border }]} nestedScrollEnabled>
            {document.sections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={[styles.tocItem, { borderBottomColor: colors.borderMuted }]}
                onPress={() => scrollToSection(sec.id)}
                activeOpacity={0.7}
              >
                <Text variant="caption" weight="bold" color={colors.primary} style={styles.tocNum}>
                  {String(sec.number).padStart(2, '0')}
                </Text>
                <Text variant="caption" color={colors.textPrimary} numberOfLines={1} style={styles.tocTitle}>
                  {sec.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Document Content */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Verification & Trust Banner */}
        <Card style={[styles.trustBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={styles.trustRow}>
            <ShieldCheck size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                Official Legal Document
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Unified Web Options Pvt Ltd • Effective Date: {document.effectiveDate}
              </Text>
            </View>
          </View>
        </Card>

        {searchQuery.trim().length > 0 && (
          <View style={styles.searchResultsInfo}>
            <Text variant="caption" weight="bold" color={colors.primary}>
              Showing {filteredSections.length} matching section{filteredSections.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Render Sections */}
        {filteredSections.map((sec) => (
          <View
            key={sec.id}
            onLayout={(event) => {
              const y = event.nativeEvent.layout.y;
              setSectionLayouts((prev) => ({ ...prev, [sec.id]: y }));
            }}
            style={[styles.sectionBox, { borderBottomColor: colors.border }]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.numberCircle, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.numberText, { color: colors.primary }]}>
                  {String(sec.number).padStart(2, '0')}
                </Text>
              </View>
              <Text variant="body" weight="bold" color={colors.textPrimary} style={styles.sectionTitle}>
                {sec.title}
              </Text>
            </View>

            <View style={styles.paragraphContainer}>
              {sec.content.map((para, pIdx) => {
                if (!para.trim()) return <View key={`spacer_${pIdx}`} style={{ height: 8 }} />;
                const isBullet = para.startsWith('•');
                return (
                  <Text
                    key={`p_${pIdx}`}
                    variant="body"
                    color={colors.textSecondary}
                    style={[
                      styles.paragraph,
                      isBullet && { paddingLeft: 12, color: colors.textPrimary, fontWeight: '500' },
                    ]}
                  >
                    {para}
                  </Text>
                );
              })}
            </View>

            {/* If this is the Third-Party section of Privacy Policy, render the structured table */}
            {showThirdPartyTable && sec.id === 'privacy-third-parties' && (
              <View style={styles.providersTableContainer}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.tableHeading}>
                  Verified Third-Party Providers & Data Processing Directory:
                </Text>
                {THIRD_PARTY_PROVIDERS.map((tp, idx) => (
                  <Card key={`tp_${idx}`} style={[styles.providerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <View style={styles.providerHeader}>
                      <Building size={14} color={colors.primary} />
                      <Text variant="body" weight="bold" color={colors.textPrimary} style={{ flex: 1, marginLeft: 6 }}>
                        {tp.provider}
                      </Text>
                    </View>
                    <View style={styles.providerRow}>
                      <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.metaLabel}>
                        Purpose:
                      </Text>
                      <Text variant="caption" color={colors.textSecondary} style={styles.metaVal}>
                        {tp.purpose}
                      </Text>
                    </View>
                    <View style={styles.providerRow}>
                      <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.metaLabel}>
                        Data Shared:
                      </Text>
                      <Text variant="caption" color={colors.textSecondary} style={styles.metaVal}>
                        {tp.dataShared}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.privacyLinkRow}
                      onPress={() => Linking.openURL(tp.privacyPolicyUrl).catch(() => {})}
                      activeOpacity={0.7}
                    >
                      <ExternalLink size={12} color={colors.primary} />
                      <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 4 }}>
                        View Provider Privacy Notice
                      </Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Bottom Legal Footer */}
        <View style={styles.bottomFooter}>
          <CheckCircle2 size={24} color="#059669" />
          <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 8 }}>
            End of Document
          </Text>
          <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 4 }}>
            Unified Web Options Pvt Ltd • All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  headerTitleBox: {
    flex: 1,
    marginHorizontal: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  updatedText: {
    fontSize: 11,
  },
  actionBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  tocToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tocToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tocContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tocNum: {
    fontSize: 11,
    width: 24,
  },
  tocTitle: {
    flex: 1,
    fontSize: 12,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  trustBanner: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultsInfo: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionBox: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
  },
  paragraphContainer: {
    gap: 8,
  },
  paragraph: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  providersTableContainer: {
    marginTop: 14,
    gap: 10,
  },
  tableHeading: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  providerCard: {
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerRow: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 12,
    lineHeight: 17,
  },
  privacyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  bottomFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 24,
  },
});
