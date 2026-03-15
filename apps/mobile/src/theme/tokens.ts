import type { AppTheme } from './types';

export const lightThemeTokens: AppTheme = {
  colors: {
    background: '#f6f8fb',
    surface: '#ffffff',
    border: '#d7dce5',
    textPrimary: '#122033',
    textSecondary: '#33445c',
    textMuted: '#4f5d75',
    brand: '#1d5fd1',
    brandSoft: '#e9f0ff',
    onBrand: '#ffffff',
  },
  typography: {
    fontSizeXs: 12,
    fontSizeSm: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 26,
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 8,
    md: 10,
    lg: 12,
  },
  shadows: {
    card: {
      shadowColor: '#0b1a33',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};
