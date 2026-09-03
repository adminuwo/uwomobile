import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Button } from './Button';
import { Inbox } from 'lucide-react-native';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode | any;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are currently no items to display.',
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing } = useTheme();

  const renderIcon = () => {
    if (!icon) return <Inbox size={32} color={colors.primary} />;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as any;
    return <IconComp size={32} color={colors.primary} />;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {renderIcon()}
      </View>
      <Text variant="h3" weight="bold" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" color={colors.textMuted} align="center" style={styles.description}>
        {description}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.actionButton}
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
  description: {
    maxWidth: 280,
    marginBottom: 20,
  },
  actionButton: {
    marginTop: 4,
  },
});
