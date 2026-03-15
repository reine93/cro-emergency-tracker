import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle">{title}</AppText>
      <AppText variant="caption" muted>
        {description}
      </AppText>
      {onRetry ? <AppButton label="Retry" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
});
