import AsyncStorage from '@react-native-async-storage/async-storage';

type KitProgress = {
  bestScore: number;
  attempts: number;
  lastPlayedAt: string;
};

const KIT_PROGRESS_KEY = 'kit_progress_v1';
let inMemoryKitProgress: KitProgress | null = null;

function isValidKitProgress(value: unknown): value is KitProgress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<KitProgress>;
  return (
    typeof candidate.bestScore === 'number' &&
    typeof candidate.attempts === 'number' &&
    typeof candidate.lastPlayedAt === 'string'
  );
}

export async function loadKitProgress(): Promise<KitProgress | null> {
  if (inMemoryKitProgress) return inMemoryKitProgress;

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(KIT_PROGRESS_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidKitProgress(parsed)) return null;
    inMemoryKitProgress = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveKitProgress(progress: KitProgress): Promise<void> {
  inMemoryKitProgress = progress;
  try {
    await AsyncStorage.setItem(KIT_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Graceful no-op when native storage is unavailable.
  }
}
