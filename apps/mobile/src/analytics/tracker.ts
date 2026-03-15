import type { GamificationAnalyticsEvent, GamificationAnalyticsEventName } from '@cro/shared';
import { ingestAnalyticsEvents } from '../api/analytics.api';
import { getOrCreatePushDeviceId } from '../notifications/push-registration.storage';

const sessionId = `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const buffer: GamificationAnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

function createEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function flushNow(): Promise<void> {
  if (isFlushing || buffer.length === 0) return;
  isFlushing = true;

  const batch = buffer.splice(0, buffer.length);
  try {
    await ingestAnalyticsEvents(batch);
  } catch {
    buffer.unshift(...batch);
    if (buffer.length > 1000) {
      buffer.splice(0, buffer.length - 1000);
    }
  } finally {
    isFlushing = false;
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;

  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushNow();
  }, 1000);
}

export function trackAnalyticsEvent(
  name: GamificationAnalyticsEventName,
  payload?: Record<string, unknown>,
): void {
  void (async () => {
    const deviceId = await getOrCreatePushDeviceId();
    buffer.push({
      id: createEventId(),
      atIso: new Date().toISOString(),
      deviceId,
      sessionId,
      name,
      payload,
    });
    scheduleFlush();
  })();
}
