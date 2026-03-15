import type { EarthquakeEvent } from '@cro/shared';

export type EarthquakeListItem = {
  id: string;
  raw: EarthquakeEvent;
  magnitude: number;
  place: string;
  source: string;
  timeIso: string;
  relativeTime: string;
  depthKm?: number;
  depthLabel: string;
};

export function formatRelativeTime(timeIso: string, now = Date.now()): string {
  const eventTime = new Date(timeIso).getTime();
  if (Number.isNaN(eventTime)) return 'Unknown time';

  const diffMs = Math.max(0, now - eventTime);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDepthLabel(depthKm?: number): string {
  if (depthKm === undefined || Number.isNaN(depthKm)) return 'Depth: n/a';
  return `Depth: ${depthKm} km`;
}

export function toEarthquakeListItem(event: EarthquakeEvent, now = Date.now()): EarthquakeListItem {
  return {
    id: event.id,
    raw: event,
    magnitude: event.magnitude,
    place: event.place,
    source: event.source,
    timeIso: event.time,
    relativeTime: formatRelativeTime(event.time, now),
    depthKm: event.depthKm,
    depthLabel: formatDepthLabel(event.depthKm),
  };
}
