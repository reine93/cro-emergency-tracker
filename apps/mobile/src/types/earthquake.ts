import type { EarthquakeEvent } from '@cro/shared';
import type { AppLanguage, TranslateFn } from '../i18n';

export type EarthquakeListItem = {
  id: string;
  raw: EarthquakeEvent;
  magnitude: number;
  place: string;
  source: string;
  timeIso: string;
  formattedTime: string;
  relativeTime: string;
  depthKm?: number;
  depthLabel: string;
};

type ListItemFormatOptions = {
  language?: AppLanguage;
  t?: TranslateFn;
};

function localize(
  t: TranslateFn | undefined,
  fallback: string,
  key: string,
  params?: Record<string, number | string>,
): string {
  return t ? t(key, params) : fallback;
}

function toLocale(language: AppLanguage | undefined): string {
  return language === 'hr' ? 'hr-HR' : 'en-GB';
}

const HR_PLACE_REPLACEMENTS: ReadonlyArray<{
  pattern: RegExp;
  replacement: string;
}> = [
  { pattern: /\bBOSNIA AND HERZEGOVINA\b/gi, replacement: 'BOSNA I HERCEGOVINA' },
  { pattern: /\bSOUTHERN ITALY\b/gi, replacement: 'JUZNA ITALIJA' },
  { pattern: /\bNORTHERN ITALY\b/gi, replacement: 'SJEVERNA ITALIJA' },
  { pattern: /\bADRIATIC SEA\b/gi, replacement: 'JADRANSKO MORE' },
  { pattern: /\bCROATIA\b/gi, replacement: 'HRVATSKA' },
  { pattern: /\bSLOVENIA\b/gi, replacement: 'SLOVENIJA' },
  { pattern: /\bHUNGARY\b/gi, replacement: 'MADARSKA' },
  { pattern: /\bSERBIA\b/gi, replacement: 'SRBIJA' },
  { pattern: /\bMONTENEGRO\b/gi, replacement: 'CRNA GORA' },
];

function applyPlaceReplacements(
  value: string,
  rules: ReadonlyArray<{ pattern: RegExp; replacement: string }>,
): string {
  return rules.reduce(
    (currentValue, rule) => currentValue.replace(rule.pattern, rule.replacement),
    value,
  );
}

export function localizePlaceName(place: string, language: AppLanguage = 'en'): string {
  if (language !== 'hr') return place;

  return applyPlaceReplacements(place, HR_PLACE_REPLACEMENTS);
}

export function formatEventTimeCroatia(
  timeIso: string,
  language: AppLanguage = 'en',
  unknownTimeLabel = 'Unknown time',
): string {
  const date = new Date(timeIso);
  if (Number.isNaN(date.getTime())) return unknownTimeLabel;

  const parts = new Intl.DateTimeFormat(toLocale(language), {
    timeZone: 'Europe/Zagreb',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const day = get('day');
  const month = get('month');
  const year = get('year');
  const hour = get('hour');
  const minute = get('minute');

  if (!day || !month || !year || !hour || !minute) return unknownTimeLabel;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function formatRelativeTime(timeIso: string, now = Date.now(), t?: TranslateFn): string {
  const eventTime = new Date(timeIso).getTime();
  if (Number.isNaN(eventTime)) return localize(t, 'Unknown time', 'common.unknownTime');

  const diffMs = Math.max(0, now - eventTime);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return localize(t, 'just now', 'feed.justNow');
  if (diffMinutes < 60)
    return localize(t, `${diffMinutes}m ago`, 'feed.minutesAgo', { count: diffMinutes });

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return localize(t, `${diffHours}h ago`, 'feed.hoursAgo', { count: diffHours });

  const diffDays = Math.floor(diffHours / 24);
  return localize(t, `${diffDays}d ago`, 'feed.daysAgo', { count: diffDays });
}

export function formatDepthLabel(depthKm: number | undefined, t?: TranslateFn): string {
  if (depthKm === undefined || Number.isNaN(depthKm))
    return localize(t, 'Depth: n/a', 'feed.depthUnknown');
  return localize(t, `Depth: ${depthKm} km`, 'feed.depthLabel', { value: depthKm });
}

export function toEarthquakeListItem(
  event: EarthquakeEvent,
  options: ListItemFormatOptions & { now?: number } = {},
): EarthquakeListItem {
  const now = options.now ?? Date.now();
  const language = options.language ?? 'en';
  const t = options.t;
  return {
    id: event.id,
    raw: event,
    magnitude: event.magnitude,
    place: localizePlaceName(event.place, language),
    source: event.source,
    timeIso: event.time,
    formattedTime: formatEventTimeCroatia(
      event.time,
      language,
      localize(t, 'Unknown time', 'common.unknownTime'),
    ),
    relativeTime: formatRelativeTime(event.time, now, t),
    depthKm: event.depthKm,
    depthLabel: formatDepthLabel(event.depthKm, t),
  };
}
