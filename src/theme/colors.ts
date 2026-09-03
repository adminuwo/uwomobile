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

  background: '#f4f7f5',
  surface: '#ffffff',
  card: '#ffffff',
  cardHover: '#f8faf9',
  inputBg: '#f1f5f3',
  modalBg: '#ffffff',
  bottomSheetBg: '#ffffff',

  border: 'rgba(5, 150, 105, 0.25)',
  borderFocus: '#059669',
  borderMuted: '#e2e8f0',
  divider: '#f1f5f9',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textEmerald: '#059669',
  textInverse: '#ffffff',

  success: '#059669',
  successBg: '#d1fae5',
  warning: '#d97706',
  warningBg: '#fef3c7',
  error: '#dc2626',
  errorBg: '#fee2e2',
  info: '#2563eb',
  infoBg: '#dbeafe',

  tabBarBg: '#ffffff',
  tabBarActive: '#059669',
  tabBarInactive: '#94a3b8',
  headerBg: '#ffffff',
};

export type ThemeColors = typeof darkThemeColors;
