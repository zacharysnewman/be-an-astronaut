import type { GameState } from './types';

export const state: GameState = {
  phase: 1,
  money: 1.00,

  availableJobs: 0.0,
  applications: 0.0,
  maxAppsReached: 0.0,
  hasBegged: false,
  hasUnlockedSubmission: false,

  openClawFinderLevel: 0,
  openClawSubmitLevel: 0,
  parentalTier: 1,

  selectedProvider: 'finite',
  contractLocked: false,
  providerTimer: 20.0,
  finiteMultiplier: 1.0,
  weeklinkMultiplier: 1.5,
  bliplyMultiplier: 2.2,

  level: 1,
  credibility: 0.0,
  approval: 50.0,
  reports: 0.0,
  paper: 10.0,

  typistLevel: 0,
  courierLevel: 0,
  procurementUnlocked: false,

  currentPaperPrice: 0.30,
  lastComplimentTime: null,
};

export let lastTimestamp       = performance.now();
export let paperPriceTimer     = 0.0;
export let cloudSaveTimer      = 0.0;
export let warningThrottleTimer = 0.0;

export function setLastTimestamp(v: number): void        { lastTimestamp = v; }
export function setPaperPriceTimer(v: number): void      { paperPriceTimer = v; }
export function setCloudSaveTimer(v: number): void       { cloudSaveTimer = v; }
export function setWarningThrottleTimer(v: number): void { warningThrottleTimer = v; }
