import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Skeleton } from './Skeleton';

interface ClientLogoBadgeProps {
  logoUri?: string | null;
  initial: string;
  size?: number;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const ClientLogoBadge: React.FC<ClientLogoBadgeProps> = ({
  logoUri,
  initial,
  size = 28,
  isLoading = false,
  style,
}) => {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [logoUri]);

  if (isLoading) {
    return <Skeleton width={size} height={size} borderRadius={size / 4} style={style} />;
  }

  const showImage = !!logoUri && !hasError;
  const displayInitial = (initial || 'W').trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: showImage ? '#FFFFFF' : colors.primary,
          borderColor: showImage ? colors.border : 'transparent',
          borderWidth: showImage ? 1 : 0,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: logoUri }}
          style={[styles.logoImage, { borderRadius: size / 4 - 1 }]}
          onError={() => setHasError(true)}
          resizeMode="contain"
        />
      ) : (
        <Text
          variant="caption"
          weight="bold"
          color="#FFFFFF"
          style={{ fontSize: Math.max(11, size * 0.48), lineHeight: size, textAlign: 'center' }}
        >
          {displayInitial}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
