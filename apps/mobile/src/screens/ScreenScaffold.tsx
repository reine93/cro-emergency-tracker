import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { theme } from '../theme/theme';

type ScreenScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onOpenSettings?: () => void;
  settingsA11yLabel?: string;
  settingsIconLabel?: string;
}>;

export function ScreenScaffold({
  title,
  subtitle,
  onOpenSettings,
  settingsA11yLabel,
  settingsIconLabel = '⚙',
  children,
}: ScreenScaffoldProps) {
  const rightAction = onOpenSettings ? (
    <Pressable
      style={styles.settingsButton}
      onPress={onOpenSettings}
      accessibilityRole="button"
      accessibilityLabel={settingsA11yLabel}
    >
      <AppText variant="subtitle">{settingsIconLabel}</AppText>
    </Pressable>
  ) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <SectionHeader title={title} subtitle={subtitle} rightAction={rightAction} />
        <View style={styles.content}>{children}</View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  settingsButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});
