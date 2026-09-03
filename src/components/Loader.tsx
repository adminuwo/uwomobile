import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

interface FullScreenLoaderProps {
  message?: string;
  style?: ViewStyle;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message = 'Loading UwoConnect...',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text variant="caption" color={colors.textSecondary} style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

interface InlineLoaderProps {
  message?: string;
  style?: ViewStyle;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ message, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && (
        <Text variant="caption" color={colors.textMuted} style={styles.inlineMessage}>
          {message}
        </Text>
      )}
    </View>
  );
};

interface ButtonLoaderProps {
  color?: string;
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({ color }) => {
  const { colors } = useTheme();
  return <ActivityIndicator size="small" color={color || colors.textInverse} />;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 14,
  },
  inline: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineMessage: {
    marginLeft: 8,
  },
});
