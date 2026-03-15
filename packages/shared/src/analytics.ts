export type AnalyticsModule = 'quiz' | 'kit' | 'home';

export type GamificationAnalyticsEventName =
  | 'module_session_started'
  | 'module_session_completed'
  | 'notification_sent'
  | 'notification_opened'
  | 'xp_progress_snapshot';

export type GamificationAnalyticsEvent = {
  id: string;
  atIso: string;
  deviceId: string;
  sessionId: string;
  name: GamificationAnalyticsEventName;
  payload?: Record<string, unknown>;
};

export type IngestAnalyticsEventsRequest = {
  events: GamificationAnalyticsEvent[];
};

export type IngestAnalyticsEventsResponse = {
  ok: true;
  accepted: number;
};

export type GamificationAnalyticsSummary = {
  totals: {
    events: number;
    devices: number;
  };
  moduleSessions: Record<
    AnalyticsModule,
    {
      started: number;
      completed: number;
      completionRate: number;
    }
  >;
  streakSessionState: {
    latestStreakDays: number;
    maxStreakDaysSeen: number;
    snapshotCount: number;
  };
  notificationOpenRate: {
    sent: number;
    opened: number;
    openRate: number;
  };
  xpProgression: Array<{
    date: string;
    totalXp: number;
    level: number;
  }>;
};
