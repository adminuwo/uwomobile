import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useConnectorsTabStore } from '../stores/connectorsTabStore';
import { useDrawerStore } from '../stores/drawerStore';

export function useAndroidBackHandler(): void {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const lastBackPressRef = useRef<number>(0);

  const segmentsRef = useRef(segments);
  const pathnameRef = useRef(pathname);

  // Keep refs up to date on every navigation change
  useEffect(() => {
    segmentsRef.current = segments;
    pathnameRef.current = pathname;
  }, [segments, pathname]);

  useEffect(() => {
    // Only relevant on Android
    if (Platform.OS !== 'android') return;

    const onBackPress = (): boolean => {
      // If sidebar drawer is open, close it first
      if (useDrawerStore.getState().isOpen) {
        useDrawerStore.getState().closeDrawer();
        return true;
      }

      const currentSegments: string[] = (segmentsRef.current as any) || [];
      const currentPath = (pathnameRef.current || '').split('?')[0].replace(/\/+$/, '').toLowerCase();

      const leafScreen = (currentSegments[currentSegments.length - 1] || '').toLowerCase();

      // Check if user is truly on the root Home screen
      const isHomeScreen = 
        leafScreen === 'home' || 
        currentPath === '/home' || 
        currentPath === '/(app)/home';

      console.log('[useAndroidBackHandler] isHomeScreen:', isHomeScreen);

      if (isHomeScreen) {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          // Double-tap on Home screen exits/minimizes the app
          return false;
        }
        lastBackPressRef.current = now;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true; // Consume event, stay in app
      }

      // ─────────────────────────────────────────────────────────────
      // User is on a sub-screen or non-Home tab. NEVER EXIT THE APP!
      // ─────────────────────────────────────────────────────────────

      // Always reset connectors category filter
      useConnectorsTabStore.getState().setTargetTab('ALL');

      // 1. Pop back in stack if history exists (returns to exact previous page)
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // 2. Fallback to Home if at the root of the history stack
      router.replace('/(app)/home' as any);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);
}
