import type { EarthquakeListItem } from '../types/earthquake';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'earthquake-alerts';

let configured = false;

export async function configureNotificationService(channelName: string): Promise<void> {
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
      name: channelName,
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 80, 150],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  configured = true;
}

export async function sendEarthquakeNotification(options: {
  event: EarthquakeListItem;
  title: string;
  body: string;
}): Promise<void> {
  const { event, title, body } = options;
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
