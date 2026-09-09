export const darkThemeColors = {
  // Brand Emerald & Teal Gradients
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#34d399',
  secondary: '#14b8a6',
  secondaryDark: '#0d9488',
  secondaryLight: '#2dd4bf',

  // Surfaces & Backgrounds (UwoConnect Dark Aesthetic)
  background: '#0a120d',
  surface: '#111e16',
  card: '#16271c',
  cardHover: '#1c3224',
  inputBg: 'rgba(0, 0, 0, 0.35)',
  modalBg: '#16271c',
  bottomSheetBg: '#111e16',

  // Borders & Dividers
  border: 'rgba(16, 185, 129, 0.20)', // Subtle emerald tint
  borderFocus: '#10b981',
  borderMuted: 'rgba(255, 255, 255, 0.10)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Typography
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa', // zinc-400
  textMuted: '#71717a',     // zinc-500
  textEmerald: '#34d399',
  textInverse: '#0a120d',

  // Status & Feedback
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.15)',

  // Tab Bar & Navigation
  tabBarBg: '#111e16',
  tabBarActive: '#10b981',
  tabBarInactive: '#71717a',
  headerBg: '#111e16',
};

export const lightThemeColors = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10b981',
  secondary: '#0d9488',
  secondaryDark: '#0f766e',
  secondaryLight: '#14b8a6',

  // Aesthetic, clean modern light canvas
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  cardHover: '#f1f5f9',
  inputBg: '#f1f5f9',
  modalBg: '#ffffff',
  bottomSheetBg: '#ffffff',

  // Clean, subtle neutral borders (prevents harsh borders)
  border: '#e2e8f0',
  borderFocus: '#059669',
  borderMuted: '#f1f5f9',
  divider: '#f1f5f9',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textEmerald: '#059669',
  textInverse: '#ffffff',

  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  error: '#dc2626',
  errorBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',

  tabBarBg: '#ffffff',
  tabBarActive: '#059669',
  tabBarInactive: '#94a3b8',
  headerBg: '#ffffff',
};

export const colors = {
  primary: {
    main: darkThemeColors.primary,
    dark: darkThemeColors.primaryDark,
    light: darkThemeColors.primaryLight,
  },
  surface: {
    card: darkThemeColors.card,
    surface: darkThemeColors.surface,
  },
  background: {
    main: darkThemeColors.background,
    secondary: darkThemeColors.surface,
  },
  border: {
    default: darkThemeColors.border,
    subtle: darkThemeColors.borderMuted,
  },
  text: {
    primary: darkThemeColors.textPrimary,
    secondary: darkThemeColors.textSecondary,
    muted: darkThemeColors.textMuted,
  },
};

export type ThemeColors = typeof darkThemeColors;

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'emerald', name: 'Emerald Velvet', primary: '#059669', accent: '#10b981' },
  { id: 'indigo', name: 'Linear Indigo', primary: '#4f46e5', accent: '#6366f1' },
  { id: 'azure', name: 'Pacific Azure', primary: '#0284c7', accent: '#38bdf8' },
  { id: 'violet', name: 'Royal Amethyst', primary: '#7c3aed', accent: '#a855f7' },
  { id: 'rose', name: 'Rose Terracotta', primary: '#e11d48', accent: '#fb7185' },
  { id: 'amber', name: 'Warm Amber', primary: '#d97706', accent: '#fbbf24' },
  { id: 'slate', name: 'Nordic Slate', primary: '#334155', accent: '#64748b' },
];

export function createCustomThemeColors(
  base: 'light' | 'dark',
  primary: string,
  accent: string
): ThemeColors {
  const basePalette = base === 'dark' ? darkThemeColors : lightThemeColors;
  const isDark = base === 'dark';

  return {
    ...basePalette,
    primary,
    primaryDark: primary,
    primaryLight: primary,
    secondary: accent,
    secondaryDark: accent,
    secondaryLight: accent,
    borderFocus: primary,
    tabBarActive: primary,
    textEmerald: primary,
    // Aesthetic subtle card borders: clean neutral border in light mode, soft dark border in dark mode
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };
}
