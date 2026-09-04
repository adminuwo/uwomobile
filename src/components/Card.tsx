import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

interface CardProps {
  children: ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
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

  const cardContent = (
    <>
      {title && (
        <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ marginBottom: 8 }}>
          {title}
        </Text>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{cardContent}</View>;
};

