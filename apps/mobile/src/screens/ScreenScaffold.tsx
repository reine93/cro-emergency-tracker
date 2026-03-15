import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { theme } from '../theme/theme';

type ScreenScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenScaffold({ title, subtitle, children }: ScreenScaffoldProps) {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <SectionHeader title={title} subtitle={subtitle} />
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
});
