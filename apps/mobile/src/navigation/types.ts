import type { EarthquakeEvent } from '@cro/shared';

export type MainTab = 'Home' | 'Tasks' | 'Progress' | 'Settings';

export type AppNavigatorState = {
  activeTab: MainTab;
  selectedEarthquake: EarthquakeEvent | null;
};
