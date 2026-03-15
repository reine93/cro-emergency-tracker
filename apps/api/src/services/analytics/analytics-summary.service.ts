import type {
  AnalyticsModule,
  GamificationAnalyticsEvent,
  GamificationAnalyticsSummary,
} from '@cro/shared';

function toModule(value: unknown): AnalyticsModule | null {
  if (value === 'quiz' || value === 'kit' || value === 'home') return value;
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function day(iso: string): string {
  return iso.slice(0, 10);
}

export function buildGamificationAnalyticsSummary(
  events: GamificationAnalyticsEvent[],
): GamificationAnalyticsSummary {
  const moduleStarted: Record<AnalyticsModule, number> = { quiz: 0, kit: 0, home: 0 };
  const moduleCompleted: Record<AnalyticsModule, number> = { quiz: 0, kit: 0, home: 0 };

  let notificationSent = 0;
  let notificationOpened = 0;

  let bucket1 = 0;
  let bucket2to3 = 0;
  let bucket4to7 = 0;
  let bucket8plus = 0;

  const xpByDate = new Map<string, { totalXp: number; level: number }>();
  const deviceIds = new Set<string>();

  for (const event of events) {
    deviceIds.add(event.deviceId);

    if (event.name === 'module_session_started') {
      const module = toModule(event.payload?.module);
      if (module) moduleStarted[module] += 1;
    }

    if (event.name === 'module_session_completed') {
      const module = toModule(event.payload?.module);
      if (module) moduleCompleted[module] += 1;
    }

    if (event.name === 'notification_sent') notificationSent += 1;
    if (event.name === 'notification_opened') notificationOpened += 1;

    if (event.name === 'xp_progress_snapshot') {
      const streak = asNumber(event.payload?.streakDays);
      if (streak !== null) {
        if (streak <= 1) bucket1 += 1;
        else if (streak <= 3) bucket2to3 += 1;
        else if (streak <= 7) bucket4to7 += 1;
        else bucket8plus += 1;
      }

      const totalXp = asNumber(event.payload?.totalXp);
      const level = asNumber(event.payload?.level);
      if (totalXp !== null && level !== null) {
        const key = day(event.atIso);
        const existing = xpByDate.get(key);
        if (!existing || totalXp > existing.totalXp) {
          xpByDate.set(key, { totalXp, level });
        }
      }
    }
  }

  const xpProgression = [...xpByDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date,
      totalXp: value.totalXp,
      level: value.level,
    }));

  return {
    totals: {
      events: events.length,
      devices: deviceIds.size,
    },
    moduleSessions: {
      quiz: {
        started: moduleStarted.quiz,
        completed: moduleCompleted.quiz,
        completionRate: percentage(moduleCompleted.quiz, moduleStarted.quiz),
      },
      kit: {
        started: moduleStarted.kit,
        completed: moduleCompleted.kit,
        completionRate: percentage(moduleCompleted.kit, moduleStarted.kit),
      },
      home: {
        started: moduleStarted.home,
        completed: moduleCompleted.home,
        completionRate: percentage(moduleCompleted.home, moduleStarted.home),
      },
    },
    streakRetention: {
      bucket1,
      bucket2to3,
      bucket4to7,
      bucket8plus,
    },
    notificationOpenRate: {
      sent: notificationSent,
      opened: notificationOpened,
      openRate: percentage(notificationOpened, notificationSent),
    },
    xpProgression,
  };
}

export function summaryToCsv(summary: GamificationAnalyticsSummary): string {
  const lines: string[] = ['section,key,value'];

  lines.push(`totals,events,${summary.totals.events}`);
  lines.push(`totals,devices,${summary.totals.devices}`);

  (['quiz', 'kit', 'home'] as const).forEach((module) => {
    const row = summary.moduleSessions[module];
    lines.push(`module_sessions.${module},started,${row.started}`);
    lines.push(`module_sessions.${module},completed,${row.completed}`);
    lines.push(`module_sessions.${module},completion_rate,${row.completionRate}`);
  });

  lines.push(`streak_retention,bucket_1,${summary.streakRetention.bucket1}`);
  lines.push(`streak_retention,bucket_2_3,${summary.streakRetention.bucket2to3}`);
  lines.push(`streak_retention,bucket_4_7,${summary.streakRetention.bucket4to7}`);
  lines.push(`streak_retention,bucket_8_plus,${summary.streakRetention.bucket8plus}`);

  lines.push(`notification_open_rate,sent,${summary.notificationOpenRate.sent}`);
  lines.push(`notification_open_rate,opened,${summary.notificationOpenRate.opened}`);
  lines.push(`notification_open_rate,open_rate,${summary.notificationOpenRate.openRate}`);

  summary.xpProgression.forEach((point) => {
    lines.push(`xp_progression.${point.date},total_xp,${point.totalXp}`);
    lines.push(`xp_progression.${point.date},level,${point.level}`);
  });

  return `${lines.join('\n')}\n`;
}
