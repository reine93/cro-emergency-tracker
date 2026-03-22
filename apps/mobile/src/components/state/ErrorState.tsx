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
      <AppText variant="subtitle">🛟</AppText>
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
    borderColor: '#f3b8b0',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: '#fff2f0',
    gap: theme.spacing.sm,
  },
});
