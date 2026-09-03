import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
}) => {
  const { colors, mode } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...style,
  };

  return (
    <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.inner, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
