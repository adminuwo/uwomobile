import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useConnectorsTabStore } from '../stores/connectorsTabStore';
import { useDrawerStore } from '../stores/drawerStore';
import { smartNavigateBack } from '../services/appNavigation';

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

      smartNavigateBack(router, pathnameRef.current || '');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);
}
