import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { usePreparedness } from '../gamification/preparedness.context';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';
import type { PreparednessBadge, PreparednessXpDelta } from '../gamification/preparedness.types';

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

type ProgressScreenProps = {
  onOpenTasks: () => void;
  onOpenSettings: () => void;
};

type AchievementItem = {
  id: string;
  text: string;
  atIso: string;
};

function reasonLabel(
  reason: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const key = `progress.reasons.${reason}`;
  const fallback = t('progress.reasons.generic');
  const translated = t(key);
  return translated === key ? fallback : translated;
}

function toAchievementFromBadge(
  badge: PreparednessBadge,
  t: (key: string, vars?: Record<string, string | number>) => string,
): AchievementItem {
  return {
    id: `badge-${badge.id}-${badge.unlockedAt}`,
    text: t('progress.achievementBadgeUnlocked', {
      badge: t(`progress.badges.${badge.id}`),
    }),
    atIso: badge.unlockedAt,
  };
}

function toAchievementFromDelta(
  delta: PreparednessXpDelta,
  t: (key: string, vars?: Record<string, string | number>) => string,
): AchievementItem {
  if (delta.amount === 0) {
    return {
      id: `activity-${delta.atIso}-${delta.reason}`,
      text: t('progress.lastActivity', { reason: reasonLabel(delta.reason, t) }),
      atIso: delta.atIso,
    };
  }

  return {
    id: `xp-${delta.atIso}-${delta.reason}`,
    text: t('progress.lastDelta', {
      value: delta.amount,
      reason: reasonLabel(delta.reason, t),
    }),
    atIso: delta.atIso,
  };
}

function isSameUtcDay(leftIso: string | null, rightIso: string): boolean {
  if (!leftIso) return false;
  const left = new Date(leftIso);
  const right = new Date(rightIso);

  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export function ProgressScreen({ onOpenTasks, onOpenSettings }: ProgressScreenProps) {
  const { t } = useI18n();
  const { profile, lastXpDelta, completeDailyAction } = usePreparedness();
  const progressPct = Math.max(
    0,
    Math.min(100, Math.round((profile.currentLevelXp / profile.nextLevelXp) * 100)),
  );
  const dailyDone = isSameUtcDay(profile.lastActivityAt, new Date().toISOString());

  const achievements = [
    ...(lastXpDelta ? [toAchievementFromDelta(lastXpDelta, t)] : []),
    ...profile.badges.map((badge) => toAchievementFromBadge(badge, t)),
  ]
    .sort((a, b) => Date.parse(b.atIso) - Date.parse(a.atIso))
    .slice(0, 8);

  return (
    <ScreenScaffold
      title={t('progress.title')}
      subtitle={t('progress.subtitle')}
      onOpenSettings={onOpenSettings}
      settingsA11yLabel={t('settings.open')}
    >
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
          <AppText variant="subtitle">{t('progress.dailyChallengeTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('progress.dailyChallengeDescription')}
          </AppText>
          <AppButton
            label={
              dailyDone ? t('progress.dailyChallengeCompleted') : t('progress.dailyChallengeAction')
            }
            onPress={completeDailyAction}
            disabled={dailyDone}
          />
        </Card>

        <Card>
          <AppText variant="subtitle">{t('progress.moduleScoresTitle')}</AppText>
          <Card>
            <AppText variant="subtitle">{t('progress.modules.quiz')}</AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleScoreLine', {
                module: t('progress.modules.quiz'),
                value: profile.moduleScores.quiz,
              })}
            </AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleDescriptions.quiz')}
            </AppText>
            <AppButton label={t('progress.openInTasks')} onPress={onOpenTasks} />
          </Card>
          <Card>
            <AppText variant="subtitle">{t('progress.modules.kit')}</AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleScoreLine', {
                module: t('progress.modules.kit'),
                value: profile.moduleScores.kit,
              })}
            </AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleDescriptions.kit')}
            </AppText>
            <AppButton label={t('progress.openInTasks')} onPress={onOpenTasks} />
          </Card>
          <Card>
            <AppText variant="subtitle">{t('progress.modules.home')}</AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleScoreLine', {
                module: t('progress.modules.home'),
                value: profile.moduleScores.home,
              })}
            </AppText>
            <AppText variant="caption" muted>
              {t('progress.moduleDescriptions.home')}
            </AppText>
            <AppButton label={t('progress.openInTasks')} onPress={onOpenTasks} />
          </Card>
        </Card>

        {lastXpDelta ? (
          <Card>
            <AppText variant="caption" muted>
              {lastXpDelta.amount !== 0
                ? t('progress.lastDelta', {
                    value: lastXpDelta.amount,
                    reason: reasonLabel(lastXpDelta.reason, t),
                  })
                : t('progress.lastActivity', { reason: reasonLabel(lastXpDelta.reason, t) })}
            </AppText>
          </Card>
        ) : null}

        <Card>
          <AppText variant="subtitle">{t('progress.achievementsTitle')}</AppText>
          {achievements.length ? (
            achievements.map((achievement) => (
              <AppText key={achievement.id} variant="caption" muted>
                • {achievement.text}
              </AppText>
            ))
          ) : (
            <AppText variant="caption" muted>
              {t('progress.noAchievements')}
            </AppText>
          )}
        </Card>
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
});
