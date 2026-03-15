import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

export function SettingsScreen() {
  const { language, setLanguage, t } = useI18n();

  return (
    <ScreenScaffold title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Card>
        <AppText variant="subtitle">{t('settings.languageLabel')}</AppText>
        <AppText variant="caption" muted>
          {t('settings.languageHint')}
        </AppText>
        <View style={styles.languageRow}>
          <Pressable
            style={[styles.langButton, language === 'en' ? styles.langButtonActive : null]}
            onPress={() => setLanguage('en')}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.settings.switchToEnglish')}
            accessibilityState={{ selected: language === 'en' }}
          >
            <AppText variant="caption" muted={language !== 'en'}>
              {t('settings.english')}
            </AppText>
          </Pressable>
          <Pressable
            style={[styles.langButton, language === 'hr' ? styles.langButtonActive : null]}
            onPress={() => setLanguage('hr')}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.settings.switchToCroatian')}
            accessibilityState={{ selected: language === 'hr' }}
          >
            <AppText variant="caption" muted={language !== 'hr'}>
              {t('settings.croatian')}
            </AppText>
          </Pressable>
        </View>
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  languageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  langButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  langButtonActive: {
    backgroundColor: theme.colors.brandSoft,
  },
});
