import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from '../ui/AppText';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle">📦</AppText>
      <AppText variant="subtitle">{title}</AppText>
      {description ? (
        <AppText variant="caption" muted>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#f3cfbe',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: '#fff8f2',
    gap: theme.spacing.xs,
  },
});
