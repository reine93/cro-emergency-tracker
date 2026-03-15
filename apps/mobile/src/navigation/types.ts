import type { EarthquakeEvent } from '@cro/shared';

export type MainTab = 'Home' | 'Feed' | 'Tasks' | 'Progress';

export type AppNavigatorState = {
  activeTab: MainTab;
  selectedEarthquake: EarthquakeEvent | null;
  settingsOpen: boolean;
};
