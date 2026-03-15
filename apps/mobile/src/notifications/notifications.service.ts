import type { EarthquakeListItem } from '../types/earthquake';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'earthquake-alerts';

let configured = false;

function formatMagnitude(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : 'n/a';
}

export async function configureNotificationService(): Promise<void> {
  if (configured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Earthquake alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 80, 150],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  configured = true;
}

export async function sendEarthquakeNotification(event: EarthquakeListItem): Promise<void> {
  await configureNotificationService();

  const magnitude = formatMagnitude(event.magnitude);
  const title = `New earthquake M${magnitude}`;
  const body = `${event.place} • ${event.formattedTime}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        earthquakeId: event.id,
        magnitude: event.magnitude,
        place: event.place,
      },
      sound: false,
    },
    trigger: null,
  });
}
