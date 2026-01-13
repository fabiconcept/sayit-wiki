/**
 * Local Storage Utility
 * Provides simple get/set functions with JSON serialization support
 */

interface LocalStorageUtil {
  get: <T = unknown>(key: string, defaultValue?: T) => T;
  set: <T = unknown>(key: string, value: T) => boolean;
  remove: (key: string) => boolean;
  clear: () => boolean;
  has: (key: string) => boolean;
}

const localStorage: LocalStorageUtil = {
  /**
   * Get a value from local storage
   * @param key - The key to retrieve
   * @param defaultValue - Default value if key doesn't exist
   * @returns The parsed value or defaultValue
   */
  get<T = unknown>(key: string, defaultValue: T = null as T): T {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item "${key}" from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set a value in local storage
   * @param key - The key to set
   * @param value - The value to store (will be JSON stringified)
   * @returns True if successful, false otherwise
   */
  set<T = unknown>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item "${key}" in localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove a value from local storage
   * @param key - The key to remove
   * @returns True if successful, false otherwise
   */
  remove(key: string): boolean {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item "${key}" from localStorage:`, error);
      return false;
    }
  },

  /**
   * Clear all items from local storage
   * @returns True if successful, false otherwise
   */
  clear(): boolean {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Check if a key exists in local storage
   * @param key - The key to check
   * @returns True if the key exists
   */
  has(key: string): boolean {
    return window.localStorage.getItem(key) !== null;
  }
};

export default localStorage;