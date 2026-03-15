import { StyleSheet } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

export function ProgressScreen() {
  const { t } = useI18n();

  return (
    <ScreenScaffold title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <AppText style={styles.message}>{t('progress.message')}</AppText>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizeMd,
  },
});
