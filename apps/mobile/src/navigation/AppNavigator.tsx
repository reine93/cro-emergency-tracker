import type { EarthquakeEvent } from '@cro/shared';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DetailsScreen } from '../screens/DetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TasksScreen } from '../screens/TasksScreen';
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
    backgroundColor: '#f6f8fb',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d7dce5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#e9f0ff',
  },
  tabLabel: {
    color: '#4d5d75',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1d5fd1',
    fontWeight: '700',
  },
});
