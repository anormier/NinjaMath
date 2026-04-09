// ==================== STORAGE UTILITIES ====================

export const STORAGE_VERSION = 1;

/**
 * Retrieve a value from localStorage, returning defaultValue on any failure.
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Persist a value to localStorage as JSON.
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable – silently ignore
  }
};
