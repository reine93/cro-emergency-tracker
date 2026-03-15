import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PreparednessProfile } from './preparedness.types';

const PREPAREDNESS_PROFILE_KEY = 'preparedness_profile_v1';

let inMemoryProfile: PreparednessProfile | null = null;

function isValidProfile(value: unknown): value is PreparednessProfile {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<PreparednessProfile>;
  return (
    typeof candidate.totalXp === 'number' &&
    typeof candidate.level === 'number' &&
    typeof candidate.currentLevelXp === 'number' &&
    typeof candidate.nextLevelXp === 'number' &&
    typeof candidate.streakDays === 'number' &&
    (typeof candidate.lastActivityAt === 'string' || candidate.lastActivityAt === null) &&
    Array.isArray(candidate.badges) &&
    typeof candidate.preparednessScore === 'number' &&
    !!candidate.moduleScores &&
    typeof candidate.moduleScores === 'object'
  );
}

export async function savePreparednessProfile(profile: PreparednessProfile): Promise<void> {
  inMemoryProfile = profile;

  try {
    await AsyncStorage.setItem(PREPAREDNESS_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Graceful no-op: AsyncStorage may be unavailable in some runtimes.
  }
}

export async function loadPreparednessProfile(): Promise<PreparednessProfile | null> {
  if (inMemoryProfile) return inMemoryProfile;

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(PREPAREDNESS_PROFILE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidProfile(parsed)) return null;
    inMemoryProfile = parsed;
    return parsed;
  } catch {
    return null;
  }
}
