import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { useTheme } from '../theme';
import { useContentStore } from '../stores/contentStore';
import { DynamicBannerItem } from '../api/content';
import { Sparkles, ArrowRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface Props {
  banners?: DynamicBannerItem[];
}

export const DynamicBannerCarousel: React.FC<Props> = ({ banners: propBanners }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const storeBanners = useContentStore((state) => state.banners);
  const activeBanners = propBanners || storeBanners.filter((b) => b.is_active && !b.draft_mode);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (slide !== activeIndex && slide >= 0 && slide < activeBanners.length) {
      setActiveIndex(slide);
    }
  };

  const handleBannerPress = (banner: DynamicBannerItem) => {
    if (!banner.action_url) return;

    if (banner.action_type === 'route') {
      const cleanRoute = banner.action_url.startsWith('/') ? banner.action_url : `/${banner.action_url}`;
      router.push(cleanRoute as any);
    } else if (banner.action_type === 'url') {
      Linking.openURL(banner.action_url).catch((err) => {
        console.log('[Banner URL Open Error]', err);
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContainer}
      >
        {activeBanners.map((banner, index) => {
          const imageUri = banner.image_url_display || banner.image_url;
          return (
            <TouchableOpacity
              key={banner.id || `banner_${index}`}
              activeOpacity={0.88}
              onPress={() => handleBannerPress(banner)}
              style={[
                styles.card,
                { 
                  width: CARD_WIDTH,
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}
            >
              {/* Image Background */}
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: colors.surface }]} />
              )}

              {/* Gradient / Translucent Content Box */}
              <View style={styles.overlayGradient}>
                <View style={styles.tagBadge}>
                  <Sparkles size={11} color="#10b981" />
                  <Text variant="caption" weight="bold" style={{ color: '#10b981', marginLeft: 4 }}>
                    Featured
                  </Text>
                </View>

                <View style={styles.textRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="label" weight="bold" style={styles.bannerTitle} numberOfLines={1}>
                      {banner.title}
                    </Text>
                    {banner.description ? (
                      <Text variant="caption" style={styles.bannerDesc} numberOfLines={2}>
                        {banner.description}
                      </Text>
                    ) : null}
                  </View>

                  {banner.action_url ? (
                    <View style={styles.arrowIconBox}>
                      <ArrowRight size={14} color="#ffffff" />
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      {activeBanners.length > 1 && (
        <View style={styles.dotsRow}>
          {activeBanners.map((_, i) => (
            <View
              key={`dot_${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? colors.primary : colors.border,
                  width: i === activeIndex ? 16 : 6,
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    height: 155,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.55)',
    justifyContent: 'space-between',
    padding: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerDesc: {
    color: '#e4e4e7',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  arrowIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
