import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Platform, StyleProp } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'caption' | 'label' | 'emerald';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
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
          fontSize: 23,
          lineHeight: 30,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h2':
        return {
          fontSize: 18,
          lineHeight: 24,
          fontWeight: weight || typography.fontWeight.bold,
          color: color || colors.textPrimary,
        };
      case 'h3':
        return {
          fontSize: 15.5,
          lineHeight: 21,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.textPrimary,
        };
      case 'subtitle':
        return {
          fontSize: 14,
          lineHeight: 19,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'caption':
        return {
          fontSize: 10,
          lineHeight: 14,
          fontWeight: weight || typography.fontWeight.regular,
          color: color || colors.textMuted,
        };
      case 'label':
        return {
          fontSize: 11.5,
          lineHeight: 16,
          fontWeight: weight || typography.fontWeight.medium,
          color: color || colors.textSecondary,
        };
      case 'emerald':
        return {
          fontSize: 13.5,
          lineHeight: 18,
          fontWeight: weight || typography.fontWeight.semibold,
          color: color || colors.primary,
        };
      case 'body':
      default:
        return {
          fontSize: 13.5,
          lineHeight: 18,
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
