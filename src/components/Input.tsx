import React, { useState, ReactNode } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors, radius, spacing, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const isPassword = secureTextEntry;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getInputWrapperStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: error
        ? colors.error
        : isFocused
        ? colors.primary
        : colors.borderMuted,
      paddingHorizontal: spacing.md,
      height: 48,
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text variant="label" style={styles.label}>{label}</Text>}

      <View style={getInputWrapperStyle()}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSize.base,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color={colors.error} style={styles.helperText}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={colors.textMuted} style={styles.helperText}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  helperText: {
    marginTop: 4,
  },
});
