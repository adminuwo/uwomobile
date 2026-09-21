import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../theme';
import { Text } from './Text';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { useDrawerStore } from '../stores/drawerStore';
import { useTenantBranding } from '../hooks/useTenantBranding';
import { ClientLogoBadge } from './ClientLogoBadge';
import { Skeleton } from './Skeleton';

import { smartNavigateBack, isRootTab } from '../services/appNavigation';

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
  showBack,
  onBackPress,
  showMenu = true,
  rightAction,
  rightElement,
  showLogo = true,
  style,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, spacing } = useTheme();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const { clientName, logoUri, initial, isLoading } = useTenantBranding();
  const actionToRender = rightElement || rightAction;

  // Root tabs that should default to showing Menu drawer instead of Back button
  const isRoot = isRootTab(pathname);

  // If showBack is explicitly passed, use it. Otherwise, if it's not a root tab, default to showing Back!
  const shouldShowBack = showBack !== undefined ? showBack : !isRoot;

  const handleBackPress = () => {
    smartNavigateBack(router, pathname, onBackPress);
  };

  // Title to display: Prefer specific screen title if passed, else tenant client company name
  const displayTitle = title || clientName;

  // Render Logo Badge only when title is absent (e.g. Home screen) and shouldShowBack is false
  const shouldRenderLogo = showLogo && !shouldShowBack && !title;

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
        {shouldShowBack ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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

        {/* Dynamic Tenant Client Logo/Initials Badge placed BEFORE company name */}
        {shouldRenderLogo && (
          <ClientLogoBadge
            logoUri={logoUri}
            initial={initial}
            isLoading={isLoading}
            size={28}
            style={styles.logoBadgeMarginRight}
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
    flexShrink: 1,
    paddingRight: 8,
  },
  iconButton: {
    marginRight: 10,
  },
  logoBadgeMarginRight: {
    marginRight: 10,
  },
  brandTitleText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
