import * as Notifications from 'expo-notifications';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

function toPermissionState(status: Notifications.PermissionStatus): NotificationPermissionState {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const existing = await Notifications.getPermissionsAsync();
  return toPermissionState(existing.status);
}

export async function ensureNotificationPermission(): Promise<NotificationPermissionState> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return 'granted';

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return toPermissionState(requested.status);
}
