import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { useDrawerStore } from '../stores/drawerStore';
import { useTenantBranding } from '../hooks/useTenantBranding';
import { ClientLogoBadge } from './ClientLogoBadge';
import { Skeleton } from './Skeleton';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showMenu?: boolean;
  rightAction?: ReactNode;
  rightElement?: ReactNode;
  showLogo?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  showMenu = true,
  rightAction,
  rightElement,
  showLogo = false,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const { clientName, logoUri, initial, isLoading } = useTenantBranding();
  const actionToRender = rightElement || rightAction;

  // Title to display: Prefer specific screen title if passed, else tenant client company name
  const displayTitle = title || clientName;

  // Render Logo Badge ONLY when showLogo is explicitly true (e.g. on Home screen)
  const shouldRenderLogo = showLogo;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.headerBg || colors.surface,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Menu size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        {/* Dynamic Tenant Client Logo Badge (Rendered ONLY when showLogo is true) */}
        {shouldRenderLogo && (
          <ClientLogoBadge
            logoUri={logoUri}
            initial={initial}
            isLoading={isLoading}
            size={30}
            style={styles.logoBadgeMargin}
          />
        )}

        {/* Display Title or Company Name */}
        {isLoading && !title ? (
          <Skeleton width={140} height={18} borderRadius={4} style={{ flexShrink: 1 }} />
        ) : (
          <Text
            variant="h3"
            weight="bold"
            color={colors.textPrimary}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.brandTitleText}
          >
            {displayTitle}
          </Text>
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
    paddingRight: 8,
  },
  iconButton: {
    marginRight: 10,
  },
  logoBadgeMargin: {
    marginRight: 10,
  },
  brandTitleText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
