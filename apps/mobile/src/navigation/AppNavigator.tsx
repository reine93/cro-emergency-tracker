import type { EarthquakeEvent } from '@cro/shared';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DetailsScreen } from '../screens/DetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { theme } from '../theme/theme';
import type { AppNavigatorState, MainTab } from './types';

const tabs: MainTab[] = ['Home', 'Tasks', 'Progress', 'Settings'];

export function AppNavigator() {
  const [state, setState] = useState<AppNavigatorState>({
    activeTab: 'Home',
    selectedEarthquake: null,
  });

  const goToTab = (tab: MainTab) => {
    setState((prev) => ({ ...prev, activeTab: tab, selectedEarthquake: null }));
  };

  const openDetails = (event: EarthquakeEvent) => {
    setState((prev) => ({ ...prev, selectedEarthquake: event }));
  };

  const goBackFromDetails = () => {
    setState((prev) => ({ ...prev, selectedEarthquake: null }));
  };

  const screen = useMemo(() => {
    if (state.selectedEarthquake) {
      return <DetailsScreen event={state.selectedEarthquake} onBack={goBackFromDetails} />;
    }

    switch (state.activeTab) {
      case 'Home':
        return <HomeScreen onOpenDetails={openDetails} />;
      case 'Tasks':
        return <TasksScreen />;
      case 'Progress':
        return <ProgressScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  }, [state.activeTab, state.selectedEarthquake]);

  return (
    <View style={styles.root}>
      <View style={styles.screenContainer}>{screen}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = state.activeTab === tab && !state.selectedEarthquake;
          return (
            <Pressable
              key={tab}
              accessibilityRole="button"
              onPress={() => goToTab(tab)}
              style={[styles.tabButton, active ? styles.tabButtonActive : null]}
            >
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>
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
