import { useEffect, useMemo, useRef, useState } from 'react';
import type { EarthquakeListItem } from '../types/earthquake';
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
  const [notificationStatus, setNotificationStatus] = useState(
    'Notifications: checking permissions...',
  );
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
        await configureNotificationService();
        const permission = await ensureNotificationPermission();
        if (cancelled) return;

        if (permission === 'granted') {
          permissionGrantedRef.current = true;
          setNotificationStatus(
            `Notifications: enabled (min M${minMagnitude.toFixed(1)}, cooldown ${Math.round(cooldownMs / 1000)}s).`,
          );
          return;
        }

        permissionGrantedRef.current = false;
        setNotificationStatus('Notifications: permission not granted.');
      } catch {
        permissionGrantedRef.current = false;
        if (!cancelled) {
          setNotificationStatus('Notifications: unavailable in this runtime.');
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
    };
  }, [cooldownMs, minMagnitude]);

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
    void sendEarthquakeNotification(newest)
      .then(() => {
        lastNotificationAtRef.current = now;
        setNotificationStatus(
          `Notifications: sent for M${newest.magnitude.toFixed(1)} at ${newest.place}.`,
        );
      })
      .catch(() => {
        setNotificationStatus('Notifications: failed to schedule local alert.');
      });
  }, [cooldownMs, dataSource, items, minMagnitude]);

  return { notificationStatus };
}
