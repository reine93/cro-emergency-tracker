import type { GamificationAnalyticsEvent } from '@cro/shared';

const eventsById = new Map<string, GamificationAnalyticsEvent>();

export function appendAnalyticsEvents(events: GamificationAnalyticsEvent[]): number {
  let accepted = 0;
  for (const event of events) {
    if (eventsById.has(event.id)) continue;
    eventsById.set(event.id, event);
    accepted += 1;
  }
  return accepted;
}

export function getAnalyticsEvents(): GamificationAnalyticsEvent[] {
  return [...eventsById.values()].sort((a, b) => a.atIso.localeCompare(b.atIso));
}

export function clearAnalyticsEventsForTests(): void {
  eventsById.clear();
}
