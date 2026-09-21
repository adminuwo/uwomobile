import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
  backgroundColor?: string;
  statusBarBg?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
  backgroundColor,
  statusBarBg,
}) => {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const topInset = safeAreaEdges.includes('top')
    ? Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0)
    : 0;
  const bottomInset = safeAreaEdges.includes('bottom') ? insets.bottom : 0;
  const leftInset = safeAreaEdges.includes('left') ? insets.left : 0;
  const rightInset = safeAreaEdges.includes('right') ? insets.right : 0;

  const resolvedBg = backgroundColor || (style as any)?.backgroundColor || colors.background;
  const defaultHeaderBg = colors.headerBg || colors.surface;
  const resolvedStatusBg = statusBarBg 
    || (style as any)?.backgroundColor 
    || (safeAreaEdges.includes('top') ? defaultHeaderBg : resolvedBg);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: resolvedStatusBg,
    paddingTop: topInset,
    paddingBottom: bottomInset,
    paddingLeft: leftInset,
    paddingRight: rightInset,
    ...style,
  };

  return (
    <View style={containerStyle}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={resolvedStatusBg}
      />
      {scrollable ? (
        <ScrollView
          style={[styles.scroll, { backgroundColor: resolvedBg }]}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.inner, { backgroundColor: resolvedBg }]}>{children}</View>
      )}
    </View>
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

