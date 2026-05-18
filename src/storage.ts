import { SAVE_STORAGE_KEY } from './constants';
import { state } from './state';
import type { GameState } from './types';
import { logMessage } from './utils';

export function triggerCloudSave(manual = false): void {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
    if (manual) {
      logMessage('Cloud Database Save forced manually. Current layout written.', 'system');
    }
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
        logMessage('Cloud save document found! Synced previous session telemetry.', 'good');
        return;
      }
    }
    logMessage('No existing cloud profile detected. Welcoming new applicant.', 'system');
  } catch (_e) {
    logMessage('Local sandbox restricted saving. Session will reset on reload.', 'bad');
  }
}
