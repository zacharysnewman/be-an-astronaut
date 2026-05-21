import { SAVE_STORAGE_KEY } from './constants';
import { state } from './state';
import type { GameState } from './types';
export function triggerCloudSave(_manual = false): void {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Local storage error: ', err);
  }
}

export function loadCloudState(): void {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw) as Partial<GameState>;
      if (typeof loaded === 'object' && loaded !== null) {
        Object.assign(state, loaded);
      }
    }
  } catch (_e) {
    // silently ignore storage errors
  }
}
