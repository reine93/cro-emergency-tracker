import type { EarthquakeEvent } from '@cro/shared';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/state/EmptyState';
import { ErrorState } from '../components/state/ErrorState';
import { LoadingState } from '../components/state/LoadingState';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { EarthquakeCard } from '../components/earthquakes/EarthquakeCard';
import {
  EarthquakeTimeWindow,
  getEarthquakeTimeWindowOptions,
  useRecentEarthquakes,
} from '../hooks/useRecentEarthquakes';
import { useEarthquakeNotifications } from '../hooks/useEarthquakeNotifications';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type HomeScreenProps = {
  onOpenDetails: (event: EarthquakeEvent) => void;
};

export function HomeScreen({ onOpenDetails }: HomeScreenProps) {
  const { t } = useI18n();
  const [timeWindow, setTimeWindow] = useState<EarthquakeTimeWindow>(
    EarthquakeTimeWindow.LastMonth,
  );
  const [showWindowOptions, setShowWindowOptions] = useState(false);
  const {
    items,
    isLoading,
    isRefreshing,
    error,
    refresh,
    infoMessage,
    lastUpdatedLabel,
    dataSource,
  } = useRecentEarthquakes(timeWindow);
  const { notificationStatus } = useEarthquakeNotifications({ items, dataSource });
  const timeWindowOptions = useMemo(() => getEarthquakeTimeWindowOptions(t), [t]);

  const selectedWindowLabel = useMemo(
    () =>
      timeWindowOptions.find((option) => option.value === timeWindow)?.label ??
      t('timeWindow.lastMonth'),
    [t, timeWindow, timeWindowOptions],
  );

  const onSelectWindow = (windowValue: EarthquakeTimeWindow) => {
    setTimeWindow(windowValue);
    setShowWindowOptions(false);
  };

  return (
    <ScreenScaffold title={t('home.title')} subtitle={t('home.subtitle')}>
      <View style={styles.filterRow}>
        <AppText variant="caption" muted>
          {t('home.timeRange')}
        </AppText>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowWindowOptions((value) => !value)}
        >
          <AppText variant="caption">{selectedWindowLabel}</AppText>
        </Pressable>
        <AppText variant="caption" muted>
          {t('home.pollingHint')}
        </AppText>
        {lastUpdatedLabel ? (
          <AppText variant="caption" muted>
            {t('home.lastUpdated', {
              value: lastUpdatedLabel,
              source: dataSource === 'cache' ? t('home.sourceCache') : t('home.sourceLive'),
            })}
          </AppText>
        ) : null}
        {infoMessage ? (
          <AppText variant="caption" muted>
            {infoMessage}
          </AppText>
        ) : null}
        <AppText variant="caption" muted>
          {notificationStatus}
        </AppText>
      </View>

      {showWindowOptions ? (
        <Card>
          {timeWindowOptions.map((option) => {
            const selected = option.value === timeWindow;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelectWindow(option.value)}
                style={[styles.optionButton, selected ? styles.optionButtonSelected : null]}
              >
                <AppText variant="caption" muted={!selected}>
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </Card>
      ) : null}

      {isLoading ? <LoadingState message={t('home.loading')} /> : null}

      {!isLoading && error ? (
        <ErrorState title={t('home.errorTitle')} description={error} onRetry={refresh} />
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <EmptyState title={t('home.emptyTitle')} description={t('home.emptyDescription')} />
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <EarthquakeCard item={item} onOpenDetails={() => onOpenDetails(item.raw)} />
          )}
        />
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  optionButton: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.brandSoft,
  },
  listContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
