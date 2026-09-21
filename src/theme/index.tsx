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
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY);
  const [accentColor, setAccentColor] = useState<string>(DEFAULT_ACCENT);
  const [customBase, setCustomBase] = useState<'light' | 'dark'>('light');

  const brand = useBrandStore((state) => state.brand);

  // 1. Instant load from local storage
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const [storedMode, storedPrimary, storedAccent, storedBase] = await Promise.all([
          secureStorage.getItem(STORAGE_KEYS.MODE),
          secureStorage.getItem(STORAGE_KEYS.PRIMARY),
          secureStorage.getItem(STORAGE_KEYS.ACCENT),
          secureStorage.getItem(STORAGE_KEYS.CUSTOM_BASE),
        ]);

        // If stale custom/slate theme is found, reset immediately to official UwoConnect green
        if (
          storedMode === 'custom' ||
          storedPrimary === '#334155' ||
          storedPrimary === '#64748b' ||
          (storedPrimary && !storedPrimary.startsWith('#05') && !storedPrimary.startsWith('#10') && !storedPrimary.startsWith('#34'))
        ) {
          setModeState('light');
          setPrimaryColor(DEFAULT_PRIMARY);
          setAccentColor(DEFAULT_ACCENT);
          await Promise.all([
            secureStorage.setItem(STORAGE_KEYS.MODE, 'light'),
            secureStorage.setItem(STORAGE_KEYS.PRIMARY, DEFAULT_PRIMARY),
            secureStorage.setItem(STORAGE_KEYS.ACCENT, DEFAULT_ACCENT),
          ]);
        } else {
          if (storedMode === 'dark' || storedMode === 'light') {
            setModeState(storedMode);
          }
          if (storedPrimary) setPrimaryColor(storedPrimary);
          if (storedAccent) setAccentColor(storedAccent);
          if (storedBase === 'dark' || storedBase === 'light') setCustomBase(storedBase);
        }
      } catch (err) {
        console.warn('[Theme] Failed to load local theme cache:', err);
      }
    };
    loadStoredTheme();
  }, []);

  // Compute theme colors dynamically - official UwoConnect Green is preserved
  let baseColors: ThemeColors;
  if (mode === 'dark') {
    baseColors = darkThemeColors;
  } else {
    baseColors = lightThemeColors;
  }

  // Strictly enforce official UwoConnect emerald green brand colors
  const brandPrimary = (brand.primary_color && brand.primary_color !== '#334155' && brand.primary_color !== '#64748b') 
    ? brand.primary_color 
    : baseColors.primary;
  const brandSecondary = (brand.secondary_color && brand.secondary_color !== '#64748b') 
    ? brand.secondary_color 
    : baseColors.secondary;

  const colors: ThemeColors = {
    ...baseColors,
    primary: brandPrimary,
    secondary: brandSecondary,
  };

  const syncToBackend = async (themeMode: ThemeMode, primary: string, accent: string) => {
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
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await secureStorage.setItem(STORAGE_KEYS.MODE, newMode);
    syncToBackend(newMode, primaryColor, accentColor);
  };

  const setMode = (newMode: ThemeMode) => {
    setThemeMode(newMode);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const setCustomTheme = async (primary: string, accent: string, base: 'light' | 'dark' = 'light') => {
    setModeState('custom');
    setPrimaryColor(primary);
    setAccentColor(accent);
    setCustomBase(base);

    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.MODE, 'custom'),
      secureStorage.setItem(STORAGE_KEYS.PRIMARY, primary),
      secureStorage.setItem(STORAGE_KEYS.ACCENT, accent),
      secureStorage.setItem(STORAGE_KEYS.CUSTOM_BASE, base),
    ]);

    syncToBackend('custom', primary, accent);
  };

  const resetTheme = async () => {
    setModeState('light');
    setPrimaryColor(DEFAULT_PRIMARY);
    setAccentColor(DEFAULT_ACCENT);
    setCustomBase('light');

    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.MODE, 'light'),
      secureStorage.setItem(STORAGE_KEYS.PRIMARY, DEFAULT_PRIMARY),
      secureStorage.setItem(STORAGE_KEYS.ACCENT, DEFAULT_ACCENT),
      secureStorage.setItem(STORAGE_KEYS.CUSTOM_BASE, 'light'),
    ]);

    syncToBackend('light', DEFAULT_PRIMARY, DEFAULT_ACCENT);
  };

  const syncWithServer = async () => {
    try {
      const serverPrefs = await preferencesApi.getPreferences();
      if (serverPrefs) {
        if (serverPrefs.theme_mode) {
          const resolvedMode = (serverPrefs.theme_mode === 'dark' || serverPrefs.theme_mode === 'light') ? serverPrefs.theme_mode : 'light';
          setModeState(resolvedMode);
          await secureStorage.setItem(STORAGE_KEYS.MODE, resolvedMode);
        }
        if (serverPrefs.primary_color) {
          const isGreen = serverPrefs.primary_color.startsWith('#05') || serverPrefs.primary_color.startsWith('#10') || serverPrefs.primary_color.startsWith('#34');
          const resolvedPrimary = isGreen ? serverPrefs.primary_color : DEFAULT_PRIMARY;
          setPrimaryColor(resolvedPrimary);
          await secureStorage.setItem(STORAGE_KEYS.PRIMARY, resolvedPrimary);
        }
        if (serverPrefs.accent_color) {
          const isAccentGreen = serverPrefs.accent_color.startsWith('#0d') || serverPrefs.accent_color.startsWith('#14') || serverPrefs.accent_color.startsWith('#10');
          const resolvedAccent = isAccentGreen ? serverPrefs.accent_color : DEFAULT_ACCENT;
          setAccentColor(resolvedAccent);
          await secureStorage.setItem(STORAGE_KEYS.ACCENT, resolvedAccent);
        }
      }
    } catch (err) {
      console.log('[Theme] Could not sync preferences from server:', err);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors,
        typography,
        spacing,
        radius,
        shadows,
        primaryColor,
        accentColor,
        customBase,
        toggleTheme,
        setMode,
        setThemeMode,
        setCustomTheme,
        resetTheme,
        syncWithServer,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
