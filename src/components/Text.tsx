import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Platform } from 'react-native';
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
          fontSize: 28,
          lineHeight: 36,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h2':
        return {
          fontSize: 22,
          lineHeight: 28,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h3':
        return {
          fontSize: 18,
          lineHeight: 24,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.textPrimary,
        };
      case 'subtitle':
        return {
          fontSize: 16,
          lineHeight: 22,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'caption':
        return {
          fontSize: 11,
          lineHeight: 16,
          fontWeight: weight || typography.fontWeight.regular,
          color: color || colors.textMuted,
        };
      case 'label':
        return {
          fontSize: 13,
          lineHeight: 18,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'emerald':
        return {
          fontSize: 15,
          lineHeight: 21,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.primary,
        };
      case 'body':
      default:
        return {
          fontSize: 15,
          lineHeight: 21,
          fontWeight: weight || typography.fontWeight.regular,
          color: color || colors.textPrimary,
        };
    }
  };

  return (
    <RNText
      style={[
        { includeFontPadding: false },
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
