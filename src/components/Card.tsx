import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const { colors, radius, spacing, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    let base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    };

    if (variant === 'outlined') {
      base.backgroundColor = 'transparent';
      base.borderColor = colors.borderFocus;
    } else if (variant === 'elevated') {
      base = { ...base, ...shadows.md };
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
