import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Button } from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
        <AlertCircle size={32} color={colors.error} />
      </View>
      <Text variant="h3" weight="bold" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" color={colors.textMuted} align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          leftIcon={<RefreshCw size={16} color={colors.textInverse} />}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    maxWidth: 280,
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 140,
  },
});
