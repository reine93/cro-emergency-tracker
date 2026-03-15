import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { useI18n } from '../i18n';
import {
  getCooldownPresets,
  getQuietHourPresets,
  useNotificationPolicy,
} from '../notifications/policy.context';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type SettingsScreenProps = {
  onClose: () => void;
};

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { language, setLanguage, t } = useI18n();
  const { policy, setCategoryEnabled, setCooldownSeconds, setQuietHours } = useNotificationPolicy();
  const cooldownPresets = getCooldownPresets();
  const quietPresets = getQuietHourPresets();

  return (
    <ScreenScaffold
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      onOpenSettings={onClose}
      settingsA11yLabel={t('settings.close')}
      settingsIconLabel="✕"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        <Card>
          <AppText variant="subtitle">{t('settings.notificationsTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('settings.notificationsHint')}
          </AppText>

          <View style={styles.settingsList}>
            {(
              [
                ['earthquakes', t('settings.notificationCategories.earthquakes')],
                ['dailyChallenge', t('settings.notificationCategories.dailyChallenge')],
                ['streakAtRisk', t('settings.notificationCategories.streakAtRisk')],
                ['badgeUnlocked', t('settings.notificationCategories.badgeUnlocked')],
                ['levelUp', t('settings.notificationCategories.levelUp')],
                [
                  'earthquakeTrainingCombo',
                  t('settings.notificationCategories.earthquakeTrainingCombo'),
                ],
              ] as const
            ).map(([key, label]) => {
              const enabled = policy.enabled[key];
              return (
                <Pressable
                  key={key}
                  style={[styles.toggleRow, enabled ? styles.langButtonActive : null]}
                  onPress={() => setCategoryEnabled(key, !enabled)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: enabled }}
                  accessibilityLabel={label}
                >
                  <AppText variant="caption">{label}</AppText>
                  <AppText variant="caption" muted>
                    {enabled ? t('settings.enabled') : t('settings.disabled')}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="subtitle">{t('settings.cooldownLabel')}</AppText>
          <View style={styles.languageRow}>
            {cooldownPresets.map((seconds) => {
              const selected = policy.cooldownSeconds === seconds;
              return (
                <Pressable
                  key={seconds}
                  style={[styles.langButton, selected ? styles.langButtonActive : null]}
                  onPress={() => setCooldownSeconds(seconds)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <AppText variant="caption">{t('settings.cooldownOption', { seconds })}</AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="subtitle">{t('settings.quietHoursLabel')}</AppText>
          <View style={styles.languageRow}>
            {quietPresets.map((preset) => {
              const selected =
                policy.quietHoursStart === preset.start && policy.quietHoursEnd === preset.end;
              return (
                <Pressable
                  key={`${preset.start}-${preset.end}`}
                  style={[styles.langButton, selected ? styles.langButtonActive : null]}
                  onPress={() => setQuietHours(preset.start, preset.end)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <AppText variant="caption">
                    {t('settings.quietHoursOption', {
                      start: String(preset.start).padStart(2, '0'),
                      end: String(preset.end).padStart(2, '0'),
                    })}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>
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
  settingsList: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  toggleRow: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  scrollContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
