import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkThemeColors, lightThemeColors, createCustomThemeColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, radius, shadows } from './spacing';
import { useBrandStore } from '../stores/brandStore';
import { secureStorage } from '../services/secureStore';
import { preferencesApi, ThemeMode } from '../api/preferences';

export * from './colors';
export * from './typography';
export * from './spacing';

export type { ThemeMode };

const STORAGE_KEYS = {
  MODE: 'uwo_theme_mode',
  PRIMARY: 'uwo_theme_primary',
  ACCENT: 'uwo_theme_accent',
  CUSTOM_BASE: 'uwo_theme_custom_base',
};

const DEFAULT_PRIMARY = '#059669';
const DEFAULT_ACCENT = '#0d9488';

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  primaryColor: string;
  accentColor: string;
  customBase: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setCustomTheme: (primary: string, accent: string, base?: 'light' | 'dark') => Promise<void>;
  resetTheme: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeState, setThemeState] = useState<{
    mode: ThemeMode;
    primaryColor: string;
    accentColor: string;
    customBase: 'light' | 'dark';
  }>({
    mode: 'light',
    primaryColor: DEFAULT_PRIMARY,
    accentColor: DEFAULT_ACCENT,
    customBase: 'light',
  });

  const brand = useBrandStore((state) => state.brand);

  // 1. Instant load from local storage
  useEffect(() => {
    let isMounted = true;
    const loadStoredTheme = async () => {
      try {
        const [storedMode, storedPrimary, storedAccent, storedBase] = await Promise.all([
          secureStorage.getItem(STORAGE_KEYS.MODE),
          secureStorage.getItem(STORAGE_KEYS.PRIMARY),
          secureStorage.getItem(STORAGE_KEYS.ACCENT),
          secureStorage.getItem(STORAGE_KEYS.CUSTOM_BASE),
        ]);

        if (isMounted) {
          setThemeState((prev) => ({
            mode: (storedMode === 'dark' || storedMode === 'light' || storedMode === 'custom') ? storedMode : prev.mode,
            primaryColor: (storedPrimary && HEX_REGEX.test(storedPrimary)) ? storedPrimary : prev.primaryColor,
            accentColor: (storedAccent && HEX_REGEX.test(storedAccent)) ? storedAccent : prev.accentColor,
            customBase: (storedBase === 'dark' || storedBase === 'light') ? storedBase : prev.customBase,
          }));
        }
      } catch (err) {
        console.warn('[Theme] Failed to load local theme cache:', err);
      }
    };
    loadStoredTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute theme colors dynamically and memoize to avoid re-renders
  const colors: ThemeColors = React.useMemo(() => {
    if (themeState.mode === 'custom') {
      return createCustomThemeColors(themeState.customBase, themeState.primaryColor, themeState.accentColor);
    }
    if (themeState.mode === 'dark') {
      const darkColors = { ...darkThemeColors };
      if (brand?.is_active && brand.primary_color && brand.primary_color !== '#334155' && brand.primary_color !== '#64748b') {
        darkColors.primary = brand.primary_color;
        darkColors.primaryDark = brand.primary_color;
        darkColors.borderFocus = brand.primary_color;
        darkColors.tabBarActive = brand.primary_color;
        darkColors.textEmerald = brand.primary_color;
      }
      return darkColors;
    }
    // Default light mode
    const lightColors = { ...lightThemeColors };
    if (brand?.is_active && brand.primary_color && brand.primary_color !== '#334155' && brand.primary_color !== '#64748b') {
      lightColors.primary = brand.primary_color;
      lightColors.primaryDark = brand.primary_color;
      lightColors.borderFocus = brand.primary_color;
      lightColors.tabBarActive = brand.primary_color;
      lightColors.textEmerald = brand.primary_color;
    }
    return lightColors;
  }, [themeState.mode, themeState.customBase, themeState.primaryColor, themeState.accentColor, brand?.is_active, brand?.primary_color]);

  const syncToBackend = React.useCallback(async (themeMode: ThemeMode, primary: string, accent: string) => {
    try {
      await preferencesApi.updatePreferences({
        theme_mode: themeMode,
        primary_color: primary,
        accent_color: accent,
      });
    } catch (err) {
      // Graceful offline tolerance: local preference remains active
      console.log('[Theme] Backend sync failed, kept local preference:', err);
    }
  }, []);

  const setThemeMode = React.useCallback(async (newMode: ThemeMode) => {
    setThemeState((prev) => {
      syncToBackend(newMode, prev.primaryColor, prev.accentColor);
      return { ...prev, mode: newMode };
    });
    await secureStorage.setItem(STORAGE_KEYS.MODE, newMode);
  }, [syncToBackend]);

  const setMode = React.useCallback((newMode: ThemeMode) => {
    setThemeMode(newMode);
  }, [setThemeMode]);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const nextMode: ThemeMode = prev.mode === 'dark' ? 'light' : 'dark';
      secureStorage.setItem(STORAGE_KEYS.MODE, nextMode).catch(() => {});
      syncToBackend(nextMode, prev.primaryColor, prev.accentColor);
      return { ...prev, mode: nextMode };
    });
  }, [syncToBackend]);

  const setCustomTheme = React.useCallback(async (primary: string, accent: string, base: 'light' | 'dark' = 'light') => {
    setThemeState({
      mode: 'custom',
      primaryColor: primary,
      accentColor: accent,
      customBase: base,
    });

    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.MODE, 'custom'),
      secureStorage.setItem(STORAGE_KEYS.PRIMARY, primary),
      secureStorage.setItem(STORAGE_KEYS.ACCENT, accent),
      secureStorage.setItem(STORAGE_KEYS.CUSTOM_BASE, base),
    ]);

    syncToBackend('custom', primary, accent);
  }, [syncToBackend]);

  const resetTheme = React.useCallback(async () => {
    setThemeState({
      mode: 'light',
      primaryColor: DEFAULT_PRIMARY,
      accentColor: DEFAULT_ACCENT,
      customBase: 'light',
    });

    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.MODE, 'light'),
      secureStorage.setItem(STORAGE_KEYS.PRIMARY, DEFAULT_PRIMARY),
      secureStorage.setItem(STORAGE_KEYS.ACCENT, DEFAULT_ACCENT),
      secureStorage.setItem(STORAGE_KEYS.CUSTOM_BASE, 'light'),
    ]);

    syncToBackend('light', DEFAULT_PRIMARY, DEFAULT_ACCENT);
  }, [syncToBackend]);

  const syncWithServer = React.useCallback(async () => {
    try {
      const serverPrefs = await preferencesApi.getPreferences();
      if (serverPrefs) {
        setThemeState((prev) => {
          const newMode = (serverPrefs.theme_mode === 'dark' || serverPrefs.theme_mode === 'light' || serverPrefs.theme_mode === 'custom')
            ? serverPrefs.theme_mode
            : prev.mode;
          const newPrimary = (serverPrefs.primary_color && HEX_REGEX.test(serverPrefs.primary_color))
            ? serverPrefs.primary_color
            : prev.primaryColor;
          const newAccent = (serverPrefs.accent_color && HEX_REGEX.test(serverPrefs.accent_color))
            ? serverPrefs.accent_color
            : prev.accentColor;

          secureStorage.setItem(STORAGE_KEYS.MODE, newMode).catch(() => {});
          secureStorage.setItem(STORAGE_KEYS.PRIMARY, newPrimary).catch(() => {});
          secureStorage.setItem(STORAGE_KEYS.ACCENT, newAccent).catch(() => {});

          return {
            ...prev,
            mode: newMode,
            primaryColor: newPrimary,
            accentColor: newAccent,
          };
        });
      }
    } catch (err) {
      console.log('[Theme] Could not sync preferences from server:', err);
    }
  }, []);

  const contextValue = React.useMemo<ThemeContextType>(() => ({
    mode: themeState.mode,
    colors,
    typography,
    spacing,
    radius,
    shadows,
    primaryColor: themeState.primaryColor,
    accentColor: themeState.accentColor,
    customBase: themeState.customBase,
    toggleTheme,
    setMode,
    setThemeMode,
    setCustomTheme,
    resetTheme,
    syncWithServer,
  }), [
    themeState.mode,
    themeState.primaryColor,
    themeState.accentColor,
    themeState.customBase,
    colors,
    toggleTheme,
    setMode,
    setThemeMode,
    setCustomTheme,
    resetTheme,
    syncWithServer,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContextValue: ThemeContextType = {
  mode: 'light',
  colors: lightThemeColors,
  typography,
  spacing,
  radius,
  shadows,
  primaryColor: DEFAULT_PRIMARY,
  accentColor: DEFAULT_ACCENT,
  customBase: 'light',
  toggleTheme: () => {},
  setMode: () => {},
  setThemeMode: async () => {},
  setCustomTheme: async () => {},
  resetTheme: async () => {},
  syncWithServer: async () => {},
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContextValue;
  }
  return context;
};
