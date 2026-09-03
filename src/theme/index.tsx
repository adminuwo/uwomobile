import React, { createContext, useContext, useState, ReactNode } from 'react';
import { darkThemeColors, lightThemeColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, radius, shadows } from './spacing';
import { useBrandStore } from '../stores/brandStore';

export * from './colors';
export * from './typography';
export * from './spacing';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const brand = useBrandStore((state) => state.brand);

  const baseColors = mode === 'dark' ? darkThemeColors : lightThemeColors;

  // Apply dynamic white-label brand primary/secondary color overrides if configured
  const colors: ThemeColors = {
    ...baseColors,
    primary: brand.primary_color || baseColors.primary,
    secondary: brand.secondary_color || baseColors.secondary,
  };

  const toggleTheme = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
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
        toggleTheme,
        setMode,
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
