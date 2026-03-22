import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useI18n } from '../../i18n';
import { theme } from '../../theme/theme';
import { AppText } from '../ui/AppText';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <AppText variant="subtitle">🌍</AppText>
      <ActivityIndicator color={theme.colors.brand} />
      <AppText variant="caption" muted>
        {message || t('common.loading')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: '#fff7ef',
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
