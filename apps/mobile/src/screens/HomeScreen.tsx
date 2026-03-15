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
  EARTHQUAKE_TIME_WINDOW_OPTIONS,
  EarthquakeTimeWindow,
  useRecentEarthquakes,
} from '../hooks/useRecentEarthquakes';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type HomeScreenProps = {
  onOpenDetails: (event: EarthquakeEvent) => void;
};

export function HomeScreen({ onOpenDetails }: HomeScreenProps) {
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

  const selectedWindowLabel = useMemo(
    () =>
      EARTHQUAKE_TIME_WINDOW_OPTIONS.find((option) => option.value === timeWindow)?.label ??
      'Last month',
    [timeWindow],
  );

  const onSelectWindow = (windowValue: EarthquakeTimeWindow) => {
    setTimeWindow(windowValue);
    setShowWindowOptions(false);
  };

  return (
    <ScreenScaffold
      title="Recent Earthquakes"
      subtitle="Live feed from backend with pull-to-refresh."
    >
      <View style={styles.filterRow}>
        <AppText variant="caption" muted>
          Time range
        </AppText>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowWindowOptions((value) => !value)}
        >
          <AppText variant="caption">{selectedWindowLabel}</AppText>
        </Pressable>
        <AppText variant="caption" muted>
          Polling: every 30s in dev (set EXPO_PUBLIC_POLL_MS to override)
        </AppText>
        {lastUpdatedLabel ? (
          <AppText variant="caption" muted>
            Last updated: {lastUpdatedLabel}
            {dataSource ? ` (${dataSource})` : ''}
          </AppText>
        ) : null}
        {infoMessage ? (
          <AppText variant="caption" muted>
            {infoMessage}
          </AppText>
        ) : null}
      </View>

      {showWindowOptions ? (
        <Card>
          {EARTHQUAKE_TIME_WINDOW_OPTIONS.map((option) => {
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

      {isLoading ? <LoadingState message="Loading recent earthquakes..." /> : null}

      {!isLoading && error ? (
        <ErrorState title="Could not load earthquakes" description={error} onRetry={refresh} />
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <EmptyState
          title="No earthquakes found"
          description="Try another time range or pull to refresh."
        />
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
