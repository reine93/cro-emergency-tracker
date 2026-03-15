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
      <ActivityIndicator color={theme.colors.brand} />
      <AppText variant="caption" muted>
        {message || t('common.loading')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
