import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizCategory } from './quiz.logic';

type QuizProgress = {
  bestScore: number;
  attempts: number;
  completedCategories: QuizCategory[];
  lastPlayedAt: string;
};

const QUIZ_PROGRESS_KEY = 'quiz_progress_v1';
let inMemoryQuizProgress: QuizProgress | null = null;

function isValidQuizProgress(value: unknown): value is QuizProgress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<QuizProgress>;

  return (
    typeof candidate.bestScore === 'number' &&
    typeof candidate.attempts === 'number' &&
    Array.isArray(candidate.completedCategories) &&
    typeof candidate.lastPlayedAt === 'string'
  );
}

export async function loadQuizProgress(): Promise<QuizProgress | null> {
  if (inMemoryQuizProgress) return inMemoryQuizProgress;

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(QUIZ_PROGRESS_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidQuizProgress(parsed)) return null;
    inMemoryQuizProgress = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveQuizProgress(progress: QuizProgress): Promise<void> {
  inMemoryQuizProgress = progress;
  try {
    await AsyncStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Graceful no-op when native storage is unavailable.
  }
}
