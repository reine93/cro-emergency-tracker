import { useEffect, useMemo, useRef, useState } from 'react';
import type { EarthquakeListItem } from '../types/earthquake';
import { useI18n } from '../i18n';
import { ensureNotificationPermission } from '../notifications/permissions';
import {
  configureNotificationService,
  sendEarthquakeNotification,
} from '../notifications/notifications.service';

type UseEarthquakeNotificationsParams = {
  items: EarthquakeListItem[];
  dataSource: 'live' | 'cache' | null;
};

type UseEarthquakeNotificationsResult = {
  notificationStatus: string;
};

const DEFAULT_COOLDOWN_MS = 2 * 60 * 1000;
const DEV_COOLDOWN_MS = 20 * 1000;
const DEFAULT_MIN_MAGNITUDE = 2.5;

function getCooldownMs(): number {
  const fromEnv = Number(process.env.EXPO_PUBLIC_NOTIFICATION_COOLDOWN_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }

  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? DEV_COOLDOWN_MS : DEFAULT_COOLDOWN_MS;
}

function getMinMagnitude(): number {
  const fromEnv = Number(process.env.EXPO_PUBLIC_NOTIFICATION_MIN_MAG);
  if (Number.isFinite(fromEnv) && fromEnv >= 0) {
    return fromEnv;
  }

  return DEFAULT_MIN_MAGNITUDE;
}

export function useEarthquakeNotifications({
  items,
  dataSource,
}: UseEarthquakeNotificationsParams): UseEarthquakeNotificationsResult {
  const { t } = useI18n();
  const [notificationStatus, setNotificationStatus] = useState(t('notifications.checking'));
  const hasInitializedIdsRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const permissionGrantedRef = useRef(false);
  const lastNotificationAtRef = useRef<number>(0);

  const minMagnitude = useMemo(() => getMinMagnitude(), []);
  const cooldownMs = useMemo(() => getCooldownMs(), []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        await configureNotificationService(t('notifications.channelName'));
        const permission = await ensureNotificationPermission();
        if (cancelled) return;

        if (permission === 'granted') {
          permissionGrantedRef.current = true;
          setNotificationStatus(
            t('notifications.enabled', {
              magnitude: minMagnitude.toFixed(1),
              seconds: Math.round(cooldownMs / 1000),
            }),
          );
          return;
        }

        permissionGrantedRef.current = false;
        setNotificationStatus(t('notifications.permissionDenied'));
      } catch {
        permissionGrantedRef.current = false;
        if (!cancelled) {
          setNotificationStatus(t('notifications.unavailable'));
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
    };
  }, [cooldownMs, minMagnitude, t]);

  useEffect(() => {
    if (!items.length) return;

    if (!hasInitializedIdsRef.current) {
      items.forEach((item) => seenIdsRef.current.add(item.id));
      hasInitializedIdsRef.current = true;
      return;
    }

    const newlySeen: EarthquakeListItem[] = [];
    items.forEach((item) => {
      if (!seenIdsRef.current.has(item.id)) {
        newlySeen.push(item);
      }
      seenIdsRef.current.add(item.id);
    });

    if (!newlySeen.length || dataSource !== 'live' || !permissionGrantedRef.current) {
      return;
    }

    const relevant = newlySeen.filter((item) => item.magnitude >= minMagnitude);
    if (!relevant.length) return;

    const now = Date.now();
    if (now - lastNotificationAtRef.current < cooldownMs) {
      return;
    }

    const newest = [...relevant].sort((a, b) => b.timeIso.localeCompare(a.timeIso))[0];
    void sendEarthquakeNotification({
      event: newest,
      title: t('notifications.alertTitle', { magnitude: newest.magnitude.toFixed(1) }),
      body: t('notifications.alertBody', { place: newest.place, time: newest.formattedTime }),
    })
      .then(() => {
        lastNotificationAtRef.current = now;
        setNotificationStatus(
          t('notifications.sent', {
            magnitude: newest.magnitude.toFixed(1),
            place: newest.place,
          }),
        );
      })
      .catch(() => {
        setNotificationStatus(t('notifications.failed'));
      });
  }, [cooldownMs, dataSource, items, minMagnitude, t]);

  return { notificationStatus };
}
