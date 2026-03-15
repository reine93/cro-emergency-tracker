import type { GamificationAnalyticsEvent, IngestAnalyticsEventsResponse } from '@cro/shared';
import { requestJson } from './client';

function assertIngestResponse(payload: unknown): asserts payload is IngestAnalyticsEventsResponse {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid response shape: expected object.');
  }
  const candidate = payload as Partial<IngestAnalyticsEventsResponse>;
  if (candidate.ok !== true || typeof candidate.accepted !== 'number') {
    throw new Error('Invalid response shape: expected ingest response.');
  }
}

export async function ingestAnalyticsEvents(
  events: GamificationAnalyticsEvent[],
): Promise<IngestAnalyticsEventsResponse> {
  const response = await requestJson<unknown>('/api/analytics/events', {
    method: 'POST',
    body: { events },
    timeoutMs: 5000,
  });

  assertIngestResponse(response);
  return response;
}
