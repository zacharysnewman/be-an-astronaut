import { SAVE_STORAGE_KEY, OLD_SAVE_STORAGE_KEY } from './constants';
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

    // Migrate from v4: in v4 'applications' was the currency; in v5 that's 'appsThruScreening'
    const rawV4 = localStorage.getItem(OLD_SAVE_STORAGE_KEY);
    if (rawV4) {
      const loaded = JSON.parse(rawV4) as Record<string, unknown>;
      if (typeof loaded === 'object' && loaded !== null) {
        Object.assign(state, loaded);
        state.appsThruScreening = (loaded.applications as number | undefined) ?? 0;
        state.applications = 0;
        if (loaded.efficiencyUnlocked === true && state.efficiencyTier === 0) {
          state.efficiencyTier = 1;
        }
        logMessage('Session migrated from v4 profile. Previous applications credited to screening pipeline.', 'good');
        return;
      }
    }

    logMessage('No existing cloud profile detected. Welcoming new applicant.', 'system');
  } catch (_e) {
    logMessage('Local sandbox restricted saving. Session will reset on reload.', 'bad');
  }
}
