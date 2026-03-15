export type ColorTokens = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandSoft: string;
  onBrand: string;
};

export type TypographyTokens = {
  fontSizeXs: number;
  fontSizeSm: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontWeightRegular: '400';
  fontWeightMedium: '500';
  fontWeightSemibold: '600';
  fontWeightBold: '700';
};

export type SpacingTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type RadiusTokens = {
  sm: number;
  md: number;
  lg: number;
};

export type ShadowTokens = {
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type AppTheme = {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
};
