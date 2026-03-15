import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'push_device_id_v1';

let inMemoryDeviceId: string | null = null;

function createDeviceId(): string {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `device_${stamp}_${random}`;
}

export async function getOrCreatePushDeviceId(): Promise<string> {
  if (inMemoryDeviceId) return inMemoryDeviceId;

  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.trim().length > 0) {
      inMemoryDeviceId = existing;
      return existing;
    }
  } catch {
    // Continue with generated id fallback.
  }

  const next = createDeviceId();
  inMemoryDeviceId = next;

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  } catch {
    // Graceful no-op when native storage is unavailable.
  }

  return next;
}
