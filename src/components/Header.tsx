import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { ChevronLeft } from 'lucide-react-native';
import { useBrandStore } from '../stores/brandStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
  rightElement?: ReactNode;
  showLogo?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  rightElement,
  showLogo = false,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const brand = useBrandStore((state) => state.brand);
  const actionToRender = rightElement || rightAction;


  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.headerBg,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {showLogo ? (
          <View style={styles.logoRow}>
            <Image
              source={brand.logo_url ? { uri: brand.logo_url } : require('../../assets/icon.png')}
              style={styles.logoImage}
            />
            <Text variant="h3" weight="bold" color={colors.primary}>
              {brand.brand_name || 'UwoConnect'}
            </Text>
          </View>
        ) : (
          title && (
            <Text variant="h3" weight="bold" color={colors.textPrimary}>
              {title}
            </Text>
          )
        )}
      </View>

      {actionToRender && <View style={styles.rightContainer}>{actionToRender}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
    resizeMode: 'contain',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
