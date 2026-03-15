import type { ScheduledPushReminder } from '@cro/shared';
import type { PushRegistration } from '../../data/push/push-registrations.store';

function isQuietHours(startHour: number, endHour: number, now: Date): boolean {
  if (startHour === endHour) return false;
  const hour = now.getUTCHours();
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

function dayDiffFrom(dateIso: string, now: Date): number {
  const from = Date.parse(dateIso.slice(0, 10));
  const today = Date.parse(now.toISOString().slice(0, 10));
  if (!Number.isFinite(from) || !Number.isFinite(today)) return Number.POSITIVE_INFINITY;
  return Math.floor((today - from) / (24 * 60 * 60 * 1000));
}

export function planGamificationReminders(
  registrations: PushRegistration[],
  now = new Date(),
): ScheduledPushReminder[] {
  return registrations.flatMap((registration) => {
    const prefs = registration.preferences;
    if (isQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd, now)) {
      return [];
    }

    const reminders: ScheduledPushReminder[] = [];
    const ageDays = dayDiffFrom(registration.registeredAt, now);

    if (prefs.dailyChallenge && ageDays >= 1) {
      reminders.push({
        deviceId: registration.deviceId,
        expoPushToken: registration.expoPushToken,
        type: 'daily_challenge',
        routeTarget: 'progress',
      });
    }

    if (prefs.streakAtRisk && ageDays >= 2) {
      reminders.push({
        deviceId: registration.deviceId,
        expoPushToken: registration.expoPushToken,
        type: 'streak_at_risk',
        routeTarget: 'progress',
        moduleTarget: 'quiz',
      });
    }

    return reminders;
  });
}
