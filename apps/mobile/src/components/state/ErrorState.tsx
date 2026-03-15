import { StyleSheet, View } from 'react-native';
import { useI18n } from '../../i18n';
import { theme } from '../../theme/theme';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('state.errorTitle');
  const resolvedDescription = description ?? t('state.errorDescription');

  return (
    <View style={styles.container}>
      <AppText variant="subtitle">{resolvedTitle}</AppText>
      <AppText variant="caption" muted>
        {resolvedDescription}
      </AppText>
      {onRetry ? <AppButton label={t('common.retry')} onPress={onRetry} /> : null}
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
