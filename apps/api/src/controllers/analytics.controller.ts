import type {
  GamificationAnalyticsEvent,
  IngestAnalyticsEventsRequest,
  IngestAnalyticsEventsResponse,
} from '@cro/shared';
import type { Request, Response } from 'express';
import {
  appendAnalyticsEvents,
  getAnalyticsEvents,
} from '../data/analytics/analytics-events.store';
import {
  buildGamificationAnalyticsSummary,
  summaryToCsv,
} from '../services/analytics/analytics-summary.service';

function isValidAnalyticsEvent(value: unknown): value is GamificationAnalyticsEvent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GamificationAnalyticsEvent>;

  const validName =
    candidate.name === 'module_session_started' ||
    candidate.name === 'module_session_completed' ||
    candidate.name === 'notification_sent' ||
    candidate.name === 'notification_opened' ||
    candidate.name === 'xp_progress_snapshot';

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.atIso === 'string' &&
    candidate.atIso.trim().length > 0 &&
    typeof candidate.deviceId === 'string' &&
    candidate.deviceId.trim().length > 0 &&
    typeof candidate.sessionId === 'string' &&
    candidate.sessionId.trim().length > 0 &&
    validName
  );
}

function isValidIngestBody(value: unknown): value is IngestAnalyticsEventsRequest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<IngestAnalyticsEventsRequest>;
  return Array.isArray(candidate.events) && candidate.events.every(isValidAnalyticsEvent);
}

export function ingestAnalyticsEventsHandler(req: Request, res: Response) {
  if (!isValidIngestBody(req.body)) {
    return res.status(400).json({ message: 'Invalid analytics events payload' });
  }

  const accepted = appendAnalyticsEvents(req.body.events);
  const payload: IngestAnalyticsEventsResponse = { ok: true, accepted };
  return res.status(200).json(payload);
}

export function getAnalyticsSummaryHandler(_req: Request, res: Response) {
  const summary = buildGamificationAnalyticsSummary(getAnalyticsEvents());
  return res.status(200).json(summary);
}

export function exportAnalyticsCsvHandler(_req: Request, res: Response) {
  const summary = buildGamificationAnalyticsSummary(getAnalyticsEvents());
  const csv = summaryToCsv(summary);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="gamification-analytics.csv"');
  return res.status(200).send(csv);
}
