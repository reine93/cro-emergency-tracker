import type { PropsWithChildren } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { theme } from '../../theme/theme';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

type AppTextProps = PropsWithChildren<{
  variant?: TextVariant;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}>;

export function AppText({ children, variant = 'body', muted = false, style }: AppTextProps) {
  return (
    <Text
      allowFontScaling
      style={[styles.base, styles[variant], muted ? styles.muted : null, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  title: {
    fontSize: theme.typography.fontSizeXl,
    fontWeight: theme.typography.fontWeightBold,
  },
  subtitle: {
    fontSize: theme.typography.fontSizeLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  body: {
    fontSize: theme.typography.fontSizeMd,
    fontWeight: theme.typography.fontWeightRegular,
  },
  caption: {
    fontSize: theme.typography.fontSizeSm,
    fontWeight: theme.typography.fontWeightMedium,
  },
  muted: {
    color: theme.colors.textMuted,
  },
});
