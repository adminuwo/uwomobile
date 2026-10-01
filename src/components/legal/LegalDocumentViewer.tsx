import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Platform,
  Linking,
  Animated,
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
  Share2,
  ExternalLink,
  ShieldCheck,
  Building,
  Scale,
  ChevronDown,
  ChevronUp
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
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [tocExpanded, setTocExpanded] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, number>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/home');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${document.title} - UWO Connect`,
        message: `${document.title} for UWO Connect (Version ${document.version}, Effective ${document.effectiveDate}).`,
      });
    } catch (e) {}
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
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

  // Auto-expand all sections if searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const allOpen: Record<string, boolean> = {};
      filteredSections.forEach(s => { allOpen[s.id] = true; });
      setExpandedSections(allOpen);
    }
  }, [searchQuery, filteredSections]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Decorative Ambient Glow */}
      <View style={[styles.ambientGlow, { backgroundColor: colors.primary + '15' }]} />

      {/* Floating/Fading Header */}
      <View style={styles.floatingHeaderContainer}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: colors.surface, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.border,
              opacity: headerOpacity 
            }
          ]} 
        />
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <Animated.Text 
            style={[styles.headerTitle, { color: colors.textPrimary, opacity: headerOpacity }]}
            numberOfLines={1}
          >
            {document.title}
          </Animated.Text>

          <TouchableOpacity onPress={handleShare} style={styles.headerBtn} activeOpacity={0.7}>
            <Share2 size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Content Wrapper */}
        <View style={[styles.paperSheet, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
          
          {/* Integrated Hero inside the sheet */}
          <View style={styles.heroSection}>
            <View style={[styles.heroBadge, { backgroundColor: colors.primary + '15' }]}>
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={[styles.heroBadgeText, { color: colors.primary }]}>Official Document</Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {document.title}
            </Text>
            <View style={styles.metaInfoRow}>
              <Text style={[styles.metaInfoText, { color: colors.textSecondary }]}>Version {document.version}</Text>
              <View style={[styles.dotSeparator, { backgroundColor: colors.textMuted }]} />
              <Text style={[styles.metaInfoText, { color: colors.textSecondary }]}>Effective {document.effectiveDate}</Text>
            </View>
          </View>

          {/* Search & TOC Toolbar */}
          <View style={styles.toolbar}>
            <View style={[styles.searchWrap, { backgroundColor: colors.inputBg, borderColor: colors.borderMuted }]}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search terms..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.tocBtn, { backgroundColor: colors.inputBg, borderColor: colors.borderMuted }]} 
              onPress={() => setTocExpanded(!tocExpanded)}
            >
              <ListFilter size={16} color={tocExpanded ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Collapsible TOC */}
          {tocExpanded && (
            <View style={[styles.tocMenu, { backgroundColor: colors.inputBg, borderColor: colors.borderMuted }]}>
              <Text style={[styles.tocHeader, { color: colors.textMuted }]}>Table of Contents</Text>
              {document.sections.map((sec) => (
                <TouchableOpacity key={`toc_${sec.id}`} style={[styles.tocRow, { borderBottomColor: colors.borderMuted }]} onPress={() => scrollToSection(sec.id)}>
                  <Text style={[styles.tocRowNum, { color: colors.primary }]}>{String(sec.number).padStart(2, '0')}.</Text>
                  <Text style={[styles.tocRowTitle, { color: colors.textPrimary }]} numberOfLines={1}>{sec.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {searchQuery.trim().length > 0 && (
            <View style={[styles.searchResultBox, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.searchResultText, { color: colors.primary }]}>Found {filteredSections.length} matching sections</Text>
            </View>
          )}

          {/* Sections List */}
          <View style={styles.sectionsWrapper}>
            {filteredSections.map((sec, index) => (
              <View 
                key={sec.id} 
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  setSectionLayouts((prev) => ({ ...prev, [sec.id]: y }));
                }}
                style={styles.sectionBlock}
              >
                {/* Timeline connector line */}
                {index !== filteredSections.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.primary + '30' }]} />
                )}
                
                {/* Section Header */}
                <TouchableOpacity 
                  style={styles.sectionHeader} 
                  onPress={() => toggleSection(sec.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sectionNumberBadge, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
                    <Text style={[styles.sectionNumberText, { color: colors.primary }]}>{String(sec.number).padStart(2, '0')}</Text>
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{sec.title}</Text>
                  
                  <View style={styles.chevronWrap}>
                    {expandedSections[sec.id] ? (
                      <ChevronUp size={20} color={colors.textMuted} />
                    ) : (
                      <ChevronDown size={20} color={colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Paragraphs & Content (Collapsible) */}
                {expandedSections[sec.id] && (
                  <View style={styles.collapsibleContent}>
                    <View style={styles.paragraphsBox}>
                      {sec.content.map((para, pIdx) => {
                        if (!para.trim()) return <View key={`spacer_${pIdx}`} style={{ height: 12 }} />;
                        const isBullet = para.startsWith('•');
                        return (
                          <Text
                            key={`p_${pIdx}`}
                            style={[styles.paragraphText, { color: colors.textSecondary }, isBullet && [styles.bulletText, { color: colors.textPrimary }]]}
                          >
                            {para}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Third Party Table */}
                    {showThirdPartyTable && sec.id === 'privacy-third-parties' && (
                      <View style={styles.thirdPartyWrapper}>
                        <Text style={[styles.thirdPartyHeading, { color: colors.textMuted }]}>Verified Data Processors</Text>
                        {THIRD_PARTY_PROVIDERS.map((tp, idx) => (
                          <View key={`tp_${idx}`} style={[styles.tpCard, { backgroundColor: colors.surface, borderColor: colors.borderMuted }]}>
                            <View style={styles.tpCardHeader}>
                              <Building size={16} color={colors.primary} />
                              <Text style={[styles.tpProviderName, { color: colors.textPrimary }]}>{tp.provider}</Text>
                            </View>
                            <Text style={[styles.tpLabel, { color: colors.textMuted }]}>PURPOSE</Text>
                            <Text style={[styles.tpValue, { color: colors.textSecondary }]}>{tp.purpose}</Text>
                            
                            <Text style={[styles.tpLabel, { color: colors.textMuted, marginTop: 8 }]}>DATA SHARED</Text>
                            <Text style={[styles.tpValue, { color: colors.textSecondary }]}>{tp.dataShared}</Text>
                            
                            <TouchableOpacity style={[styles.tpLink, { borderTopColor: colors.borderMuted }]} onPress={() => Linking.openURL(tp.privacyPolicyUrl).catch(() => {})}>
                              <ExternalLink size={12} color={colors.primary} />
                              <Text style={[styles.tpLinkText, { color: colors.primary }]}>View Privacy Notice</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={[styles.footerMark, { borderTopColor: colors.borderMuted }]}>
            <Scale size={24} color={colors.primary + '50'} />
            <Text style={[styles.footerMarkText, { color: colors.textMuted }]}>End of Document</Text>
            <Text style={[styles.footerCopy, { color: colors.textMuted }]}>Unified Web Options Pvt Ltd © {new Date().getFullYear()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.8,
  },
  floatingHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 70,
    zIndex: 100,
  },
  headerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    flex: 1,
    textAlign: 'center',
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 116 : 86,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  paperSheet: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 34,
    marginBottom: 12,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 10,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  tocBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tocMenu: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  tocHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tocRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tocRowNum: {
    fontSize: 13,
    fontWeight: '800',
    width: 24,
  },
  tocRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  searchResultBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  searchResultText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionsWrapper: {
    paddingLeft: 8,
  },
  sectionBlock: {
    marginBottom: 40,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 40,
    bottom: -40,
    width: 2,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  sectionNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionNumberText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  chevronWrap: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  collapsibleContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  paragraphsBox: {
    paddingLeft: 52, // Align with text
  },
  paragraphText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletText: {
    fontWeight: '500',
    paddingLeft: 10,
  },
  thirdPartyWrapper: {
    paddingLeft: 52,
    marginTop: 10,
  },
  thirdPartyHeading: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  tpCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  tpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tpProviderName: {
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  tpLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tpValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  tpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tpLinkText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  footerMark: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingTop: 40,
    borderTopWidth: 1,
  },
  footerMarkText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
  },
  footerCopy: {
    fontSize: 13,
    marginTop: 4,
  },
});
