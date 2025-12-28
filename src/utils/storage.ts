/**
 * Browser localStorage utilities for persisting application state
 */

const STORAGE_KEYS = {
  JSON_CONTENT: 'json-formatter-content',
  DIFF_LEFT_CONTENT: 'json-formatter-diff-left',
  DIFF_RIGHT_CONTENT: 'json-formatter-diff-right',
  VIEW_MODE: 'json-formatter-view-mode',
} as const;

/**
 * Safely get item from localStorage
 */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage.getItem failed:', error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('localStorage.setItem failed:', error);
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('localStorage.removeItem failed:', error);
  }
}

/**
 * Load JSON content from storage
 */
export function loadJsonContent(): string | null {
  return getStorageItem(STORAGE_KEYS.JSON_CONTENT);
}

/**
 * Save JSON content to storage
 */
export function saveJsonContent(content: string): void {
  setStorageItem(STORAGE_KEYS.JSON_CONTENT, content);
}

/**
 * Load diff left content from storage
 */
export function loadDiffLeftContent(): string | null {
  return getStorageItem(STORAGE_KEYS.DIFF_LEFT_CONTENT);
}

/**
 * Save diff left content to storage
 */
export function saveDiffLeftContent(content: string): void {
  setStorageItem(STORAGE_KEYS.DIFF_LEFT_CONTENT, content);
}

/**
 * Load diff right content from storage
 */
export function loadDiffRightContent(): string | null {
  return getStorageItem(STORAGE_KEYS.DIFF_RIGHT_CONTENT);
}

/**
 * Save diff right content to storage
 */
export function saveDiffRightContent(content: string): void {
  setStorageItem(STORAGE_KEYS.DIFF_RIGHT_CONTENT, content);
}

/**
 * Load view mode from storage
 */
export function loadViewMode(): string | null {
  return getStorageItem(STORAGE_KEYS.VIEW_MODE);
}

/**
 * Save view mode to storage
 */
export function saveViewMode(mode: string): void {
  setStorageItem(STORAGE_KEYS.VIEW_MODE, mode);
}

/**
 * Clear all stored data
 */
export function clearAllStorage(): void {
  removeStorageItem(STORAGE_KEYS.JSON_CONTENT);
  removeStorageItem(STORAGE_KEYS.DIFF_LEFT_CONTENT);
  removeStorageItem(STORAGE_KEYS.DIFF_RIGHT_CONTENT);
  removeStorageItem(STORAGE_KEYS.VIEW_MODE);
}
