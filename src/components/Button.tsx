import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const { colors, radius, spacing, typography } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
    };

    // Size padding
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.xs + 2;
        base.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        base.paddingVertical = spacing.lg - 2;
        base.paddingHorizontal = spacing.xl;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.lg;
        break;
    }

    // Variant Colors
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.secondary;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.error;
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary;
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.5;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'primary':
      case 'secondary':
      case 'danger':
      default:
        return colors.textInverse;
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <TouchableOpacity style={styles.iconLeft}>{leftIcon}</TouchableOpacity>}
          <Text
            variant={size === 'sm' ? 'caption' : 'body'}
            weight="bold"
            color={getTextColor()}
            style={textStyle}
          >
            {title}
          </Text>
          {rightIcon && <TouchableOpacity style={styles.iconRight}>{rightIcon}</TouchableOpacity>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
