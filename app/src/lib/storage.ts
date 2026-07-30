import { createMMKV } from 'react-native-mmkv';

/** Stable storage keys shared by game persistence, settings, and replay features. */
export const storageKeys = {
  currentGame: 'game:current',
  settings: 'settings',
  replay: (id: string) => `replays:${id}`,
} as const;

let mmkv: ReturnType<typeof createMMKV> | undefined;

function getStorage(): ReturnType<typeof createMMKV> {
  mmkv ??= createMMKV({ id: 'seal' });
  return mmkv;
}

/** Stores a JSON-safe value. Game state must be serialized by the engine before calling this. */
export function setJson(key: string, value: unknown): void {
  getStorage().set(key, JSON.stringify(value));
}

/** Reads a JSON-safe value, removing malformed stale data instead of propagating it into the app. */
export function getJson<T>(key: string): T | null {
  const value = getStorage().getString(key);
  if (value === undefined) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    getStorage().remove(key);
    return null;
  }
}

/** Deletes a persisted value when a game is completed or a setting is reset. */
export function removeValue(key: string): void {
  getStorage().remove(key);
}

/** Persists the engine's serialized game representation under the current-game key. */
export function saveSerializedGame(serializedState: string): void {
  getStorage().set(storageKeys.currentGame, serializedState);
}

/** Returns the engine's serialized game representation, if a local game is available. */
export function loadSerializedGame(): string | null {
  return getStorage().getString(storageKeys.currentGame) ?? null;
}

/** Test-only reset for the lazily created native storage instance. */
export function resetStorageForTests(): void {
  mmkv = undefined;
}

/** Injects a storage double for unit tests without requiring a native runtime. */
export function setStorageForTests(storage: ReturnType<typeof createMMKV>): void {
  mmkv = storage;
}
