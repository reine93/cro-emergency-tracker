import type { EarthquakeEvent } from '@cro/shared';
import type { NotificationModuleTarget } from '../hooks/useNotificationOrchestrator';

export type MainTab = 'Home' | 'Feed' | 'Tasks' | 'Progress';

export type AppNavigatorState = {
  activeTab: MainTab;
  selectedEarthquake: EarthquakeEvent | null;
  settingsOpen: boolean;
  taskModuleIntent: NotificationModuleTarget | null;
};
