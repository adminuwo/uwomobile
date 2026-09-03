import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
}) => {
  const { colors, radius } = useTheme();

  const getColors = (): { bg: string; text: string } => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBg, text: colors.success };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning };
      case 'error':
        return { bg: colors.errorBg, text: colors.error };
      case 'info':
        return { bg: colors.infoBg, text: colors.info };
      case 'neutral':
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: radius.full }, style]}>
      <Text variant="caption" weight="bold" color={text}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
