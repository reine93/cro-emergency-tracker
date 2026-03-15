import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { EarthquakeListItem } from '../types/earthquake';
import { useI18n } from '../i18n';
import * as Notifications from 'expo-notifications';
import { ensureNotificationPermission } from '../notifications/permissions';
import {
  addNotificationResponseListener,
  configureNotificationService,
  sendEarthquakeNotification,
  sendNotification,
} from '../notifications/notifications.service';
import { registerExpoPushToken } from '../api/notifications.api';
import type { PreparednessProfile, PreparednessXpDelta } from '../gamification/preparedness.types';
import { useNotificationPolicy } from '../notifications/policy.context';
import { getOrCreatePushDeviceId } from '../notifications/push-registration.storage';
import { trackAnalyticsEvent } from '../analytics/tracker';

export type NotificationRouteTarget = 'home' | 'feed' | 'tasks' | 'progress';
export type NotificationModuleTarget = 'quiz' | 'kit' | 'home';

type UseNotificationOrchestratorParams = {
  items: EarthquakeListItem[];
  dataSource: 'live' | 'cache' | null;
  profile: PreparednessProfile;
  lastXpDelta: PreparednessXpDelta | null;
  onNavigateFromNotification: (target: {
    route: NotificationRouteTarget;
    module?: NotificationModuleTarget;
  }) => void;
};

type UseNotificationOrchestratorResult = {
  notificationStatus: string;
};

const DEFAULT_MIN_MAGNITUDE = 2.5;

function getMinMagnitude(): number {
  const fromEnv = Number(process.env.EXPO_PUBLIC_NOTIFICATION_MIN_MAG);
  if (Number.isFinite(fromEnv) && fromEnv >= 0) return fromEnv;
  return DEFAULT_MIN_MAGNITUDE;
}

function dayBucket(iso = new Date().toISOString()): string {
  return iso.slice(0, 10);
}

function getUtcHour(now = new Date()): number {
  return now.getUTCHours();
}

function isQuietHours(startHour: number, endHour: number, now = new Date()): boolean {
  if (startHour === endHour) return false;
  const hour = getUtcHour(now);
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return dayBucket(iso) === dayBucket();
}

function dayDiffFromToday(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const last = Date.parse(iso.slice(0, 10));
  const today = Date.parse(dayBucket());
  if (!Number.isFinite(last) || !Number.isFinite(today)) return Number.POSITIVE_INFINITY;
  return Math.floor((today - last) / (24 * 60 * 60 * 1000));
}

function parseRouteData(
  data: unknown,
): { route: NotificationRouteTarget; module?: NotificationModuleTarget } | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const route = record.routeTarget;
  const module = record.moduleTarget;

  if (route !== 'home' && route !== 'feed' && route !== 'tasks' && route !== 'progress') {
    return null;
  }

  if (module === 'quiz' || module === 'kit' || module === 'home') {
    return { route, module };
  }

  return { route };
}

export function useNotificationOrchestrator({
  items,
  dataSource,
  profile,
  lastXpDelta,
  onNavigateFromNotification,
}: UseNotificationOrchestratorParams): UseNotificationOrchestratorResult {
  const { t } = useI18n();
  const { policy } = useNotificationPolicy();
  const [notificationStatus, setNotificationStatus] = useState(t('notifications.checking'));
  const permissionGrantedRef = useRef(false);
  const seenEarthquakeIdsRef = useRef<Set<string>>(new Set());
  const initializedEarthquakeIdsRef = useRef(false);
  const dedupRef = useRef<Set<string>>(new Set());
  const lastCategorySentAtRef = useRef<Record<string, number>>({});
  const lastLevelRef = useRef(profile.level);
  const knownBadgeIdsRef = useRef<Set<string>>(new Set(profile.badges.map((badge) => badge.id)));
  const expoPushTokenRef = useRef<string | null>(null);

  const minMagnitude = useMemo(() => getMinMagnitude(), []);

  const canSendCategoryNow = useCallback(
    (category: string): boolean => {
      if (isQuietHours(policy.quietHoursStart, policy.quietHoursEnd)) return false;
      const now = Date.now();
      const lastSent = lastCategorySentAtRef.current[category] ?? 0;
      if (now - lastSent < policy.cooldownSeconds * 1000) return false;
      lastCategorySentAtRef.current[category] = now;
      return true;
    },
    [policy.cooldownSeconds, policy.quietHoursEnd, policy.quietHoursStart],
  );

  const shouldDedup = useCallback((key: string): boolean => {
    if (dedupRef.current.has(key)) return false;
    dedupRef.current.add(key);
    return true;
  }, []);

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
              seconds: policy.cooldownSeconds,
            }),
          );
          return;
        }

        permissionGrantedRef.current = false;
        setNotificationStatus(t('notifications.permissionDenied'));
      } catch {
        permissionGrantedRef.current = false;
        if (!cancelled) setNotificationStatus(t('notifications.unavailable'));
      }
    };

    void setup();
    return () => {
      cancelled = true;
    };
  }, [minMagnitude, policy.cooldownSeconds, t]);

  useEffect(() => {
    if (!permissionGrantedRef.current) return;

    let cancelled = false;

    const registerRemote = async () => {
      try {
        let token = expoPushTokenRef.current;
        if (!token) {
          const tokenResult = await Notifications.getExpoPushTokenAsync();
          token = tokenResult.data;
          expoPushTokenRef.current = token;
        }

        const deviceId = await getOrCreatePushDeviceId();
        if (cancelled) return;

        await registerExpoPushToken({
          deviceId,
          expoPushToken: token,
          platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'unknown',
          preferences: {
            earthquakes: policy.enabled.earthquakes,
            dailyChallenge: policy.enabled.dailyChallenge,
            streakAtRisk: policy.enabled.streakAtRisk,
            badgeUnlocked: policy.enabled.badgeUnlocked,
            levelUp: policy.enabled.levelUp,
            earthquakeTrainingCombo: policy.enabled.earthquakeTrainingCombo,
            quietHoursStart: policy.quietHoursStart,
            quietHoursEnd: policy.quietHoursEnd,
            cooldownSeconds: policy.cooldownSeconds,
          },
        });

        if (!cancelled) {
          setNotificationStatus(t('notifications.remoteRegistered'));
        }
      } catch {
        if (!cancelled) {
          setNotificationStatus(t('notifications.remoteUnavailableLocalFallback'));
        }
      }
    };

    void registerRemote();

    return () => {
      cancelled = true;
    };
  }, [
    policy.cooldownSeconds,
    policy.enabled.badgeUnlocked,
    policy.enabled.dailyChallenge,
    policy.enabled.earthquakeTrainingCombo,
    policy.enabled.earthquakes,
    policy.enabled.levelUp,
    policy.enabled.streakAtRisk,
    policy.quietHoursEnd,
    policy.quietHoursStart,
    t,
  ]);

  useEffect(() => {
    return addNotificationResponseListener((response) => {
      const route = parseRouteData(response.notification.request.content.data);
      if (!route) return;
      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      trackAnalyticsEvent('notification_opened', {
        type: data?.type ?? 'unknown',
        routeTarget: route.route,
      });
      onNavigateFromNotification(route);
    });
  }, [onNavigateFromNotification]);

  useEffect(() => {
    if (!items.length) return;

    if (!initializedEarthquakeIdsRef.current) {
      items.forEach((item) => seenEarthquakeIdsRef.current.add(item.id));
      initializedEarthquakeIdsRef.current = true;
      return;
    }

    const newlySeen = items.filter((item) => !seenEarthquakeIdsRef.current.has(item.id));
    items.forEach((item) => seenEarthquakeIdsRef.current.add(item.id));

    if (!newlySeen.length || dataSource !== 'live' || !permissionGrantedRef.current) return;

    if (!policy.enabled.earthquakes) return;
    if (!canSendCategoryNow('earthquakes')) return;

    const relevant = newlySeen.filter((item) => item.magnitude >= minMagnitude);
    if (!relevant.length) return;

    const newest = [...relevant].sort((a, b) => b.timeIso.localeCompare(a.timeIso))[0];
    const dedupKey = `eq:${newest.id}`;
    if (!shouldDedup(dedupKey)) return;

    void sendEarthquakeNotification({
      event: newest,
      title: t('notifications.alertTitle', { magnitude: newest.magnitude.toFixed(1) }),
      body: t('notifications.alertBody', { place: newest.place, time: newest.formattedTime }),
      data: {
        routeTarget: 'feed',
        type: 'earthquake',
      },
    })
      .then(() => {
        trackAnalyticsEvent('notification_sent', { type: 'earthquake', routeTarget: 'feed' });
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

    if (policy.enabled.earthquakeTrainingCombo && newest.magnitude >= 4.0) {
      const comboKey = `combo:${newest.id}:${dayBucket()}`;
      if (shouldDedup(comboKey) && canSendCategoryNow('earthquakeTrainingCombo')) {
        trackAnalyticsEvent('notification_sent', {
          type: 'earthquake_training_combo',
          routeTarget: 'tasks',
        });
        void sendNotification({
          title: t('notifications.comboTitle'),
          body: t('notifications.comboBody'),
          data: {
            routeTarget: 'tasks',
            moduleTarget: 'quiz',
            type: 'earthquake_training_combo',
          },
        });
      }
    }
  }, [canSendCategoryNow, dataSource, items, minMagnitude, policy, shouldDedup, t]);

  useEffect(() => {
    if (!permissionGrantedRef.current) return;

    if (profile.level > lastLevelRef.current && policy.enabled.levelUp) {
      const key = `level:${profile.level}`;
      if (shouldDedup(key) && canSendCategoryNow('levelUp')) {
        trackAnalyticsEvent('notification_sent', { type: 'level_up', routeTarget: 'progress' });
        void sendNotification({
          title: t('notifications.levelUpTitle'),
          body: t('notifications.levelUpBody', { level: profile.level }),
          data: {
            routeTarget: 'progress',
            type: 'level_up',
          },
        });
      }
    }
    lastLevelRef.current = profile.level;
  }, [canSendCategoryNow, policy.enabled.levelUp, profile.level, shouldDedup, t]);

  useEffect(() => {
    if (!permissionGrantedRef.current || !policy.enabled.badgeUnlocked) return;

    const known = knownBadgeIdsRef.current;
    const newlyUnlocked = profile.badges.filter((badge) => !known.has(badge.id));
    if (!newlyUnlocked.length) return;

    newlyUnlocked.forEach((badge) => {
      known.add(badge.id);
      const key = `badge:${badge.id}`;
      if (!shouldDedup(key) || !canSendCategoryNow('badgeUnlocked')) return;
      trackAnalyticsEvent('notification_sent', { type: 'badge_unlocked', routeTarget: 'progress' });
      void sendNotification({
        title: t('notifications.badgeUnlockedTitle'),
        body: t('notifications.badgeUnlockedBody', { badge: t(`progress.badges.${badge.id}`) }),
        data: {
          routeTarget: 'progress',
          type: 'badge_unlocked',
        },
      });
    });
  }, [canSendCategoryNow, policy.enabled.badgeUnlocked, profile.badges, shouldDedup, t]);

  useEffect(() => {
    if (!permissionGrantedRef.current) return;
    const todayBucket = dayBucket();

    if (policy.enabled.dailyChallenge && !isToday(profile.lastActivityAt)) {
      const key = `daily:${todayBucket}`;
      if (shouldDedup(key) && canSendCategoryNow('dailyChallenge')) {
        trackAnalyticsEvent('notification_sent', {
          type: 'daily_challenge',
          routeTarget: 'progress',
        });
        void sendNotification({
          title: t('notifications.dailyChallengeTitle'),
          body: t('notifications.dailyChallengeBody'),
          data: {
            routeTarget: 'progress',
            type: 'daily_challenge',
          },
        });
      }
    }

    if (policy.enabled.streakAtRisk && dayDiffFromToday(profile.lastActivityAt) === 1) {
      const key = `streak:${todayBucket}`;
      if (shouldDedup(key) && canSendCategoryNow('streakAtRisk')) {
        trackAnalyticsEvent('notification_sent', {
          type: 'streak_at_risk',
          routeTarget: 'progress',
        });
        void sendNotification({
          title: t('notifications.streakRiskTitle'),
          body: t('notifications.streakRiskBody', { days: profile.streakDays }),
          data: {
            routeTarget: 'progress',
            type: 'streak_at_risk',
          },
        });
      }
    }
  }, [
    canSendCategoryNow,
    lastXpDelta,
    policy,
    profile.lastActivityAt,
    profile.streakDays,
    shouldDedup,
    t,
  ]);

  return { notificationStatus };
}
