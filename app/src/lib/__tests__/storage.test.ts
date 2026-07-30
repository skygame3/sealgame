import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  getJson,
  loadSerializedGame,
  removeValue,
  resetStorageForTests,
  saveSerializedGame,
  setStorageForTests,
  setJson,
  storageKeys,
} from '../storage';

const mockValues = new Map<string, string>();
const mockRemove = jest.fn((key: string) => mockValues.delete(key));
const mockSet = jest.fn((key: string, value: string) => mockValues.set(key, value));
const mockGetString = jest.fn((key: string) => mockValues.get(key));

describe('storage', () => {
  beforeEach(() => {
    mockValues.clear();
    jest.clearAllMocks();
    resetStorageForTests();
    setStorageForTests({
      getString: mockGetString,
      remove: mockRemove,
      set: mockSet,
    } as never);
  });

  afterEach(() => {
    resetStorageForTests();
  });

  it('stores and reads JSON values', () => {
    setJson(storageKeys.settings, { language: 'ko' });

    expect(getJson<{ language: string }>(storageKeys.settings)).toEqual({ language: 'ko' });
  });

  it('returns null for missing or malformed JSON and removes stale data', () => {
    expect(getJson(storageKeys.currentGame)).toBeNull();
    mockValues.set(storageKeys.currentGame, '{not json');

    expect(getJson(storageKeys.currentGame)).toBeNull();
    expect(mockRemove).toHaveBeenCalledWith(storageKeys.currentGame);
  });

  it('saves, loads, and removes engine-serialized game data without parsing it', () => {
    const serializedState = '{"version":1,"moves":[]}';
    saveSerializedGame(serializedState);

    expect(loadSerializedGame()).toBe(serializedState);
    removeValue(storageKeys.currentGame);
    expect(loadSerializedGame()).toBeNull();
  });

  it('creates replay keys in the shared namespace', () => {
    expect(storageKeys.replay('2026-07-30')).toBe('replays:2026-07-30');
  });
});
