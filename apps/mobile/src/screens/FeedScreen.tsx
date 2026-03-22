import type { EarthquakeEvent } from '@cro/shared';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/state/EmptyState';
import { ErrorState } from '../components/state/ErrorState';
import { LoadingState } from '../components/state/LoadingState';
import { AppText } from '../components/ui/AppText';
import { EarthquakeCard } from '../components/earthquakes/EarthquakeCard';
import {
  EarthquakeTimeWindow,
  getEarthquakeTimeWindowOptions,
  useRecentEarthquakes,
} from '../hooks/useRecentEarthquakes';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type FeedScreenProps = {
  onOpenDetails: (event: EarthquakeEvent) => void;
  onOpenSettings: () => void;
};

export function FeedScreen({ onOpenDetails, onOpenSettings }: FeedScreenProps) {
  const { t } = useI18n();
  const isDevEnvironment = process.env.NODE_ENV !== 'production';
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
    <ScreenScaffold
      title={t('feedScreen.title')}
      subtitle={t('feedScreen.subtitle')}
      onOpenSettings={onOpenSettings}
      settingsA11yLabel={t('settings.open')}
    >
      <View style={styles.filterRow}>
        <AppText variant="caption" muted>
          {isDevEnvironment ? t('home.pollingHintDev') : t('home.pollingHintProd')}
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
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowWindowOptions(true)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.home.timeRangeButton')}
          accessibilityHint={t('a11y.home.timeRangeButtonHint')}
          accessibilityState={{ expanded: showWindowOptions }}
        >
          <AppText variant="caption" style={styles.filterButtonIcon}>
            ⏱
          </AppText>
          <AppText variant="caption" style={styles.filterButtonLabel}>
            {selectedWindowLabel}
          </AppText>
        </Pressable>
      </View>

      <Modal
        visible={showWindowOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWindowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <AppText variant="subtitle">{t('home.timeRange')}</AppText>
              <Pressable
                onPress={() => setShowWindowOptions(false)}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel={t('settings.close')}
              >
                <AppText variant="caption">✕</AppText>
              </Pressable>
            </View>
            {timeWindowOptions.map((option) => {
              const selected = option.value === timeWindow;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onSelectWindow(option.value)}
                  style={[styles.optionButton, selected ? styles.optionButtonSelected : null]}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.home.selectTimeRangeOption', {
                    option: option.label,
                  })}
                  accessibilityState={{ selected }}
                >
                  <AppText variant="caption" muted={!selected}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

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
          accessibilityLabel={t('a11y.home.earthquakeList')}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              accessibilityLabel={t('a11y.home.pullToRefresh')}
            />
          }
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
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f2b39f',
    backgroundColor: '#ffe7dc',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  filterButtonLabel: {
    color: theme.colors.brand,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  filterButtonIcon: {
    color: theme.colors.brand,
  },
  optionButton: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.brandSoft,
    borderColor: theme.colors.brand,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 22, 24, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3eb',
  },
  listContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
