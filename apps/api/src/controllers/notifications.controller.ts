import type { RegisterExpoPushTokenRequest, RegisterExpoPushTokenResponse } from '@cro/shared';
import type { Request, Response } from 'express';
import {
  getAllPushRegistrations,
  upsertPushRegistration,
} from '../data/push/push-registrations.store';
import { planGamificationReminders } from '../services/push/push-reminders.service';

function isValidHour(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 23;
}

function isValidPreferences(value: unknown): value is RegisterExpoPushTokenRequest['preferences'] {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RegisterExpoPushTokenRequest['preferences']>;

  return (
    typeof candidate.earthquakes === 'boolean' &&
    typeof candidate.dailyChallenge === 'boolean' &&
    typeof candidate.streakAtRisk === 'boolean' &&
    typeof candidate.badgeUnlocked === 'boolean' &&
    typeof candidate.levelUp === 'boolean' &&
    typeof candidate.earthquakeTrainingCombo === 'boolean' &&
    isValidHour(candidate.quietHoursStart) &&
    isValidHour(candidate.quietHoursEnd) &&
    typeof candidate.cooldownSeconds === 'number' &&
    Number.isFinite(candidate.cooldownSeconds) &&
    candidate.cooldownSeconds > 0
  );
}

function isValidRegisterRequest(value: unknown): value is RegisterExpoPushTokenRequest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RegisterExpoPushTokenRequest>;

  return (
    typeof candidate.deviceId === 'string' &&
    candidate.deviceId.trim().length > 0 &&
    typeof candidate.expoPushToken === 'string' &&
    candidate.expoPushToken.trim().length > 0 &&
    (candidate.platform === 'ios' ||
      candidate.platform === 'android' ||
      candidate.platform === 'unknown') &&
    isValidPreferences(candidate.preferences)
  );
}

export function registerExpoPushTokenHandler(req: Request, res: Response) {
  if (!isValidRegisterRequest(req.body)) {
    return res.status(400).json({ message: 'Invalid push registration payload' });
  }

  const registered = upsertPushRegistration(req.body);
  const payload: RegisterExpoPushTokenResponse = {
    ok: true,
    registeredAt: registered.registeredAt,
  };
  return res.status(200).json(payload);
}

export function previewGamificationRemindersHandler(req: Request, res: Response) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  const reminders = planGamificationReminders(getAllPushRegistrations());
  return res.status(200).json({ items: reminders });
}
