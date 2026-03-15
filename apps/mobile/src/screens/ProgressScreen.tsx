import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { usePreparedness } from '../gamification/preparedness.context';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

const LEVEL_TITLES = [
  'Beginner',
  'Aware Citizen',
  'Prepared Resident',
  'Safety Planner',
  'Community Ready',
];

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level - 1] ?? `Level ${level}`;
}

function isDebugActionsEnabled(): boolean {
  const raw = process.env.EXPO_PUBLIC_ENABLE_GAMIFICATION_DEBUG_ACTIONS?.trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export function ProgressScreen() {
  const { t } = useI18n();
  const { profile, lastXpDelta, completeDailyAction, addXp, updateModuleScore } = usePreparedness();
  const progressPct = Math.max(
    0,
    Math.min(100, Math.round((profile.currentLevelXp / profile.nextLevelXp) * 100)),
  );
  const showDebugActions = isDebugActionsEnabled();

  return (
    <ScreenScaffold title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <AppText variant="subtitle">
            {t('progress.levelLabel', {
              level: profile.level,
              title: getLevelTitle(profile.level),
            })}
          </AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <AppText variant="caption" muted>
            {t('progress.progressToNext', {
              current: profile.currentLevelXp,
              target: profile.nextLevelXp,
              pct: progressPct,
            })}
          </AppText>
          <View style={styles.metaRow}>
            <Pill label={t('progress.totalXp', { value: profile.totalXp })} />
            <Pill label={t('progress.streak', { value: profile.streakDays })} />
            <Pill label={t('progress.preparednessScore', { value: profile.preparednessScore })} />
          </View>
        </Card>

        <Card>
          <AppText variant="subtitle">{t('progress.badgesTitle')}</AppText>
          {profile.badges.length ? (
            <View style={styles.badgesRow}>
              {profile.badges.map((badge) => (
                <Pill key={badge.id} label={t(`progress.badges.${badge.id}`)} />
              ))}
            </View>
          ) : (
            <AppText variant="caption" muted>
              {t('progress.noBadges')}
            </AppText>
          )}
        </Card>

        <Card>
          <AppText variant="subtitle">{t('progress.moduleScoresTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('progress.moduleScoreLine', {
              module: t('progress.modules.quiz'),
              value: profile.moduleScores.quiz,
            })}
          </AppText>
          <AppText variant="caption" muted>
            {t('progress.moduleScoreLine', {
              module: t('progress.modules.kit'),
              value: profile.moduleScores.kit,
            })}
          </AppText>
          <AppText variant="caption" muted>
            {t('progress.moduleScoreLine', {
              module: t('progress.modules.home'),
              value: profile.moduleScores.home,
            })}
          </AppText>
        </Card>

        {showDebugActions ? (
          <Card>
            <AppText variant="subtitle">{t('progress.actionsTitle')}</AppText>
            <View style={styles.actionsRow}>
              <AppButton label={t('progress.actions.daily')} onPress={completeDailyAction} />
              <AppButton
                label={t('progress.actions.quizBoost')}
                onPress={() => {
                  const next = Math.min(100, profile.moduleScores.quiz + 10);
                  updateModuleScore('quiz', next, 'quiz_score_update');
                  addXp(10, 'quiz_practice');
                }}
              />
            </View>
            <View style={styles.actionsRow}>
              <AppButton
                label={t('progress.actions.kitBoost')}
                onPress={() => {
                  const next = Math.min(100, profile.moduleScores.kit + 10);
                  updateModuleScore('kit', next, 'kit_score_update');
                  addXp(10, 'kit_practice');
                }}
              />
              <AppButton
                label={t('progress.actions.homeBoost')}
                onPress={() => {
                  const next = Math.min(100, profile.moduleScores.home + 10);
                  updateModuleScore('home', next, 'home_score_update');
                  addXp(10, 'home_practice');
                }}
              />
            </View>
          </Card>
        ) : null}

        {lastXpDelta ? (
          <Card>
            <AppText variant="caption" muted>
              {lastXpDelta.amount !== 0
                ? t('progress.lastDelta', { value: lastXpDelta.amount, reason: lastXpDelta.reason })
                : t('progress.lastActivity', { reason: lastXpDelta.reason })}
            </AppText>
          </Card>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  progressTrack: {
    borderRadius: theme.radius.sm,
    height: 10,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.brand,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
