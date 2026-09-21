import React, { ReactNode, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ViewStyle,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../theme';
import { isRootTab, smartNavigateBack } from '../services/appNavigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
  backgroundColor?: string;
  statusBarBg?: string;
  enableSwipeBack?: boolean;
  onSwipeBack?: () => void;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
  backgroundColor,
  statusBarBg,
  enableSwipeBack,
  onSwipeBack,
}) => {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const isSubScreen = !isRootTab(pathname);
  const shouldEnableSwipe = enableSwipeBack !== undefined ? enableSwipeBack : isSubScreen;

  const translateX = useRef(new Animated.Value(0)).current;
  const isEdgeSwipe = useRef(false);
  const isNavigating = useRef(false);

  const panResponder = useMemo(() => {
    if (!shouldEnableSwipe) {
      return null;
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Only capture touches starting within 50px of the left edge
        return evt.nativeEvent.pageX <= 50;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only activate for horizontal right drag, ignore vertical scrolling
        const startedAtEdge = evt.nativeEvent.pageX - gestureState.dx <= 50;
        const isRightDrag = gestureState.dx > 12;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return startedAtEdge && isRightDrag && isHorizontal;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60 || gestureState.vx > 0.4) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 140,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (onSwipeBack) {
              onSwipeBack();
            } else {
              smartNavigateBack(router, pathname);
            }
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          bounciness: 4,
          useNativeDriver: true,
        }).start();
      },
    });
  }, [shouldEnableSwipe, router, pathname, onSwipeBack]);

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

  const screenContent = (
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

  if (shouldEnableSwipe && panResponder) {
    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.animatedWrapper, { transform: [{ translateX }], backgroundColor: resolvedBg }]}
      >
        {screenContent}
      </Animated.View>
    );
  }

  return screenContent;
};

const styles = StyleSheet.create({
  animatedWrapper: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  scroll: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});


