import type { PushNotificationPreferences } from '@cro/shared';

export type PushRegistration = {
  deviceId: string;
  expoPushToken: string;
  platform: 'ios' | 'android' | 'unknown';
  preferences: PushNotificationPreferences;
  registeredAt: string;
};

const registrationsByDevice = new Map<string, PushRegistration>();

export function upsertPushRegistration(input: {
  deviceId: string;
  expoPushToken: string;
  platform: 'ios' | 'android' | 'unknown';
  preferences: PushNotificationPreferences;
  nowIso?: string;
}): PushRegistration {
  const next: PushRegistration = {
    deviceId: input.deviceId,
    expoPushToken: input.expoPushToken,
    platform: input.platform,
    preferences: input.preferences,
    registeredAt: input.nowIso ?? new Date().toISOString(),
  };

  registrationsByDevice.set(input.deviceId, next);
  return next;
}

export function getAllPushRegistrations(): PushRegistration[] {
  return [...registrationsByDevice.values()];
}

export function clearPushRegistrationsForTests(): void {
  registrationsByDevice.clear();
}
