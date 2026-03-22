import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
};

export function SectionHeader({ title, subtitle, rightAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <AppText variant="title">{title}</AppText>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
      {subtitle ? (
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
    backgroundColor: '#fff0e8',
    borderWidth: 1,
    borderColor: '#f3cfbe',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rightAction: {
    flexShrink: 0,
  },
});
