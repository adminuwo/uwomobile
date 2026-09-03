import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'caption' | 'label' | 'emerald';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  weight,
  align = 'left',
  style,
  ...props
}) => {
  const { colors, typography } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize['3xl'],
          lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize['2xl'],
          lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize.xl,
          lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.textPrimary,
        };
      case 'subtitle':
        return {
          fontSize: typography.fontSize.lg,
          lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'caption':
        return {
          fontSize: typography.fontSize.xs,
          lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.regular,
          color: color || colors.textMuted,
        };
      case 'label':
        return {
          fontSize: typography.fontSize.sm,
          lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'emerald':
        return {
          fontSize: typography.fontSize.base,
          lineHeight: typography.fontSize.base * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.primary,
        };
      case 'body':
      default:
        return {
          fontSize: typography.fontSize.base,
          lineHeight: typography.fontSize.base * typography.lineHeight.normal,
          fontWeight: weight || typography.fontWeight.regular,
          color: color || colors.textPrimary,
        };
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        align !== 'auto' && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
