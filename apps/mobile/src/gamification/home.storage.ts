import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeSafetyProgress = {
  bestScore: number;
  attempts: number;
  lastAssessmentAt: string;
};

const HOME_SAFETY_PROGRESS_KEY = 'home_safety_progress_v1';
let inMemoryHomeProgress: HomeSafetyProgress | null = null;

function isValidHomeSafetyProgress(value: unknown): value is HomeSafetyProgress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<HomeSafetyProgress>;

  return (
    typeof candidate.bestScore === 'number' &&
    typeof candidate.attempts === 'number' &&
    typeof candidate.lastAssessmentAt === 'string'
  );
}

export async function loadHomeSafetyProgress(): Promise<HomeSafetyProgress | null> {
  if (inMemoryHomeProgress) return inMemoryHomeProgress;

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(HOME_SAFETY_PROGRESS_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidHomeSafetyProgress(parsed)) return null;
    inMemoryHomeProgress = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveHomeSafetyProgress(progress: HomeSafetyProgress): Promise<void> {
  inMemoryHomeProgress = progress;

  try {
    await AsyncStorage.setItem(HOME_SAFETY_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Graceful no-op when native storage is unavailable.
  }
}
