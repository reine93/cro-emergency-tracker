import type { EarthquakeEvent } from '@cro/shared';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import {
  type NotificationModuleTarget,
  type NotificationRouteTarget,
  useNotificationOrchestrator,
} from '../hooks/useNotificationOrchestrator';
import { EarthquakeTimeWindow, useRecentEarthquakes } from '../hooks/useRecentEarthquakes';
import { useI18n } from '../i18n';
import { usePreparedness } from '../gamification/preparedness.context';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { theme } from '../theme/theme';
import type { AppNavigatorState, MainTab } from './types';

const tabs: MainTab[] = ['Home', 'Feed', 'Tasks', 'Progress'];

export function AppNavigator() {
  const { t } = useI18n();
  const [state, setState] = useState<AppNavigatorState>({
    activeTab: 'Home',
    selectedEarthquake: null,
    settingsOpen: false,
    taskModuleIntent: null,
  });
  const { items: globalItems, dataSource: globalDataSource } = useRecentEarthquakes(
    EarthquakeTimeWindow.LastMonth,
  );
  const { profile, lastXpDelta } = usePreparedness();

  const onNavigateFromNotification = useCallback(
    (target: { route: NotificationRouteTarget; module?: NotificationModuleTarget }) => {
      const routeToTab: Record<NotificationRouteTarget, MainTab> = {
        home: 'Home',
        feed: 'Feed',
        tasks: 'Tasks',
        progress: 'Progress',
      };
      const activeTab = routeToTab[target.route];

      setState((prev) => ({
        ...prev,
        activeTab,
        selectedEarthquake: null,
        settingsOpen: false,
        taskModuleIntent: activeTab === 'Tasks' ? (target.module ?? null) : null,
      }));
    },
    [],
  );

  const { notificationStatus } = useNotificationOrchestrator({
    items: globalItems,
    dataSource: globalDataSource,
    profile,
    lastXpDelta,
    onNavigateFromNotification,
  });

  const goToTab = (tab: MainTab) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      selectedEarthquake: null,
      settingsOpen: false,
      taskModuleIntent: null,
    }));
  };

  const openDetails = (event: EarthquakeEvent) => {
    setState((prev) => ({ ...prev, selectedEarthquake: event, settingsOpen: false }));
  };

  const goBackFromDetails = () => {
    setState((prev) => ({ ...prev, selectedEarthquake: null }));
  };

  const openTasks = () => {
    setState((prev) => ({
      ...prev,
      activeTab: 'Tasks',
      selectedEarthquake: null,
      settingsOpen: false,
      taskModuleIntent: null,
    }));
  };

  const openProgressHub = () => {
    setState((prev) => ({
      ...prev,
      activeTab: 'Progress',
      selectedEarthquake: null,
      settingsOpen: false,
      taskModuleIntent: null,
    }));
  };

  const openFeed = () => {
    setState((prev) => ({
      ...prev,
      activeTab: 'Feed',
      selectedEarthquake: null,
      settingsOpen: false,
      taskModuleIntent: null,
    }));
  };

  const openSettings = () => {
    setState((prev) => ({
      ...prev,
      settingsOpen: true,
      selectedEarthquake: null,
      taskModuleIntent: null,
    }));
  };

  const closeSettings = () => {
    setState((prev) => ({ ...prev, settingsOpen: false }));
  };

  const tabLabels: Record<MainTab, string> = {
    Home: t('tabs.home'),
    Feed: t('tabs.feed'),
    Tasks: t('tabs.tasks'),
    Progress: t('tabs.progress'),
  };

  const screen = useMemo(() => {
    if (state.selectedEarthquake) {
      return <DetailsScreen event={state.selectedEarthquake} onBack={goBackFromDetails} />;
    }

    if (state.settingsOpen) {
      return <SettingsScreen onClose={closeSettings} />;
    }

    switch (state.activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onOpenDetails={openDetails}
            onOpenProgressHub={openProgressHub}
            onOpenFeed={openFeed}
            onOpenSettings={openSettings}
            notificationStatus={notificationStatus}
          />
        );
      case 'Feed':
        return (
          <FeedScreen
            onOpenDetails={openDetails}
            onOpenSettings={openSettings}
            notificationStatus={notificationStatus}
          />
        );
      case 'Tasks':
        return (
          <TasksScreen
            onOpenSettings={openSettings}
            moduleIntent={state.taskModuleIntent}
            onConsumedModuleIntent={() => setState((prev) => ({ ...prev, taskModuleIntent: null }))}
          />
        );
      case 'Progress':
        return (
          <ProgressScreen
            onOpenTasks={openTasks}
            onOpenSettings={openSettings}
            notificationStatus={notificationStatus}
          />
        );
      default:
        return null;
    }
  }, [
    notificationStatus,
    state.activeTab,
    state.selectedEarthquake,
    state.settingsOpen,
    state.taskModuleIntent,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.screenContainer}>{screen}</View>
      {!state.settingsOpen ? (
        <View style={styles.tabBar} accessibilityRole="tablist">
          {tabs.map((tab) => {
            const active = state.activeTab === tab && !state.selectedEarthquake;
            return (
              <Pressable
                key={tab}
                accessibilityRole="tab"
                accessibilityLabel={t('a11y.navigation.openTab', { tab: tabLabels[tab] })}
                accessibilityState={{ selected: active }}
                onPress={() => goToTab(tab)}
                style={[styles.tabButton, active ? styles.tabButtonActive : null]}
              >
                <AppText
                  variant="caption"
                  style={[styles.tabLabel, active ? styles.tabLabelActive : null]}
                >
                  {tabLabels[tab]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.brandSoft,
  },
  tabLabel: {
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeightMedium,
  },
  tabLabelActive: {
    color: theme.colors.brand,
    fontWeight: theme.typography.fontWeightBold,
  },
});
