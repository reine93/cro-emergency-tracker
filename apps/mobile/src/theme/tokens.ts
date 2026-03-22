import type { AppTheme } from './types';

export const lightThemeTokens: AppTheme = {
  colors: {
    background: '#fff5ee',
    surface: '#fffdf9',
    border: '#f1c9b2',
    textPrimary: '#35282a',
    textSecondary: '#634a4f',
    textMuted: '#7f6870',
    brand: '#ff6f61',
    brandSoft: '#ffe2dc',
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
    sm: 10,
    md: 14,
    lg: 18,
  },
  shadows: {
    card: {
      shadowColor: '#71312a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
      elevation: 3,
    },
  },
};
