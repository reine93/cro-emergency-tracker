export type PushNotificationPreferences = {
  earthquakes: boolean;
  dailyChallenge: boolean;
  streakAtRisk: boolean;
  badgeUnlocked: boolean;
  levelUp: boolean;
  earthquakeTrainingCombo: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  cooldownSeconds: number;
};

export type RegisterExpoPushTokenRequest = {
  deviceId: string;
  expoPushToken: string;
  platform: 'ios' | 'android' | 'unknown';
  preferences: PushNotificationPreferences;
};

export type RegisterExpoPushTokenResponse = {
  ok: true;
  registeredAt: string;
};

export type ScheduledReminderType = 'daily_challenge' | 'streak_at_risk';

export type ScheduledPushReminder = {
  deviceId: string;
  expoPushToken: string;
  type: ScheduledReminderType;
  routeTarget: 'progress';
  moduleTarget?: 'quiz' | 'kit' | 'home';
};
