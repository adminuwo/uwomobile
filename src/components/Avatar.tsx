import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'md',
  isOnline,
  style,
}) => {
  const { colors, radius } = useTheme();

  const getDimensions = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 56;
      case 'xl':
        return 72;
      case 'md':
      default:
        return 44;
    }
  };

  const dim = getDimensions();

  const getInitials = (str: string): string => {
    if (!str) return '?';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[{ width: dim, height: dim }, styles.container, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            variant={size === 'sm' ? 'caption' : size === 'xl' ? 'h2' : 'body'}
            weight="bold"
            color={colors.primary}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isOnline !== undefined && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isOnline ? colors.success : colors.textMuted,
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
