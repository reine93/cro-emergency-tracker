import type { EarthquakeEvent } from '@cro/shared';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/state/EmptyState';
import { LoadingState } from '../components/state/LoadingState';
import { EarthquakeCard } from '../components/earthquakes/EarthquakeCard';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { usePreparedness } from '../gamification/preparedness.context';
import { EarthquakeTimeWindow, useRecentEarthquakes } from '../hooks/useRecentEarthquakes';
import { useI18n } from '../i18n';
import { formatEventTimeCroatia } from '../types/earthquake';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type HomeScreenProps = {
  onOpenDetails: (event: EarthquakeEvent) => void;
  onOpenFeed: () => void;
  onOpenProgressHub: () => void;
  onOpenSettings: () => void;
};

export function HomeScreen({
  onOpenDetails,
  onOpenFeed,
  onOpenProgressHub,
  onOpenSettings,
}: HomeScreenProps) {
  const { profile } = usePreparedness();
  const { t, language } = useI18n();
  const { items, isLoading, error } = useRecentEarthquakes(EarthquakeTimeWindow.LastWeek);

  const latestItems = useMemo(() => items.slice(0, 3), [items]);
  const lastActivityLabel = profile.lastActivityAt
    ? formatEventTimeCroatia(profile.lastActivityAt, language, t('common.unknownTime'))
    : t('homeDashboard.noActivity');

  return (
    <ScreenScaffold
      title={t('homeDashboard.title')}
      subtitle={t('homeDashboard.subtitle')}
      onOpenSettings={onOpenSettings}
      settingsA11yLabel={t('settings.open')}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <AppText variant="subtitle">{t('homeDashboard.preparednessTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('homeDashboard.lastTaskCompleted', { value: lastActivityLabel })}
          </AppText>
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionButton}
              onPress={onOpenProgressHub}
              accessibilityRole="button"
              accessibilityLabel={t('homeDashboard.openHub')}
            >
              <AppText>{t('homeDashboard.openHub')}</AppText>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={onOpenFeed}
              accessibilityRole="button"
              accessibilityLabel={t('homeDashboard.openFeed')}
            >
              <AppText>{t('homeDashboard.openFeed')}</AppText>
            </Pressable>
          </View>
        </Card>

        <Card>
          <AppText variant="subtitle">{t('homeDashboard.latestEarthquakes')}</AppText>
          <AppText variant="caption" muted>
            {t('homeDashboard.latestEarthquakesHint')}
          </AppText>

          {isLoading ? <LoadingState message={t('home.loading')} /> : null}

          {!isLoading && error ? (
            <AppText variant="caption" muted>
              {error}
            </AppText>
          ) : null}

          {!isLoading && !error && latestItems.length === 0 ? (
            <EmptyState
              title={t('homeDashboard.noEarthquakesTitle')}
              description={t('homeDashboard.noEarthquakesDescription')}
            />
          ) : null}

          {!isLoading && !error && latestItems.length > 0 ? (
            <View style={styles.listWrap}>
              {latestItems.map((item) => (
                <EarthquakeCard
                  key={item.id}
                  item={item}
                  onOpenDetails={() => onOpenDetails(item.raw)}
                />
              ))}
            </View>
          ) : null}

          <Pressable
            style={styles.actionButton}
            onPress={onOpenFeed}
            accessibilityRole="button"
            accessibilityLabel={t('homeDashboard.viewAllEarthquakes')}
          >
            <AppText>{t('homeDashboard.viewAllEarthquakes')}</AppText>
          </Pressable>
        </Card>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  listWrap: {
    gap: theme.spacing.sm,
  },
});
