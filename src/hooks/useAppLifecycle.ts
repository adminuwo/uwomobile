import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface AppLifecycleState {
  appState: AppStateStatus;
  isForeground: boolean;
}

export const useAppLifecycle = (
  onForeground?: () => void,
  onBackground?: () => void
): AppLifecycleState => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (onForeground) onForeground();
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        if (onBackground) onBackground();
      }

      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);

  return {
    appState,
    isForeground: appState === 'active',
  };
};
