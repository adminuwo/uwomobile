import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

/**
 * Safe, non-intrusive OTA update policy (EAS Update / expo-updates).
 *
 * - Cold start: handled natively (checkOnLaunch=ALWAYS, launchWaitMs=0) — launch is never
 *   blocked by the network; a downloaded update is applied on the NEXT cold start.
 * - Resume: if the app has been running for a long time, check + download in the background
 *   (throttled). We deliberately NEVER call `Updates.reloadAsync()` here, so payments,
 *   uploads, form submissions, OAuth/browser redirects and other in-progress work are never
 *   interrupted. User session/secure storage is untouched by updates.
 * - No-op on web, in development (__DEV__), and when expo-updates native module is absent or disabled.
 * - All errors (offline, server, incompatible) are swallowed; the app keeps running the
 *   currently-launched bundle. Native error recovery handles rollbacks.
 */
const MIN_CHECK_INTERVAL_MS = 60 * 60 * 1000; // at most one resume-check per hour

function getExpoUpdates(): typeof import('expo-updates') | null {
  if (Platform.OS === 'web' || __DEV__) {
    return null;
  }
  try {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    if (requireOptionalNativeModule && !requireOptionalNativeModule('ExpoUpdates')) {
      return null;
    }
    const Updates = require('expo-updates');
    if (!Updates || !Updates.isEnabled) {
      return null;
    }
    return Updates;
  } catch {
    return null;
  }
}

export function useOtaUpdates(): void {
  // Native already checked at cold launch, so start the throttle window now.
  const lastCheckRef = useRef<number>(Date.now());
  const inFlightRef = useRef(false);
  const downloadedRef = useRef(false);

  useEffect(() => {
    const Updates = getExpoUpdates();
    if (!Updates) {
      return;
    }

    if (Updates.isEmergencyLaunch) {
      console.warn('[OTA] Emergency launch: running embedded bundle after an update failed to load.');
    }

    const checkInBackground = async () => {
      if (inFlightRef.current || downloadedRef.current) return;
      if (Date.now() - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) return;

      inFlightRef.current = true;
      lastCheckRef.current = Date.now();
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          const fetched = await Updates.fetchUpdateAsync();
          if (fetched.isNew) {
            // Applied automatically on next cold start. Intentionally no reload here.
            downloadedRef.current = true;
          }
        }
      } catch (error: any) {
        // Offline / server unavailable / no compatible update — safe to ignore.
        console.log('[OTA] Background update check skipped:', error?.message || error);
      } finally {
        inFlightRef.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkInBackground().catch(() => {});
      }
    });

    return () => subscription.remove();
  }, []);
}
