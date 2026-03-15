import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

type ScreenScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenScaffold({ title, subtitle, children }: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizeXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSizeSm,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
});
