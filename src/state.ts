import type { GameState } from './types';
import { generateProviderPriceSets } from './utils';

export const PROVIDER_PRICE_SETS = generateProviderPriceSets(15);

export const state: GameState = {
  phase: 1,
  money: 5.00,

  availableJobs: Math.floor(Math.random() * 101) + 100,
  applications: 0.0,
  applyCredits: 0.0,
  maxACReached: 0.0,
  hasUnlockedSubmission: true,
  hasSubmittedApp: false,
  jobSearchTier: 0,

  openClawSubmitLevel: 0,
  efficiencyTier: 0,

  selectedProvider: 'finite',
  contractLocked: false,
  providerTimer: 60.0,
  finiteMultiplier: 1.0,
  weeklinkMultiplier: 1.5,
  bliplyMultiplier: 2.2,
  providerPriceIndex: 0,

  level: 1,
  customerPoints: 0.0,
  approval: 50.0,
  lastComplimentTime: null,
  emails: [],
  macrofirmApplied: false,
  indebtPromoSent: false,
};

export let lastTimestamp     = performance.now();
export let cloudSaveTimer    = 0.0;
export let moneyDisplayTimer = 0.0;
export let displayedMoney       = state.money;
export let totalAppsSubmitted   = 0.0;

export function setLastTimestamp(v: number): void    { lastTimestamp = v; }
export function setCloudSaveTimer(v: number): void   { cloudSaveTimer = v; }
export function setMoneyDisplayTimer(v: number): void { moneyDisplayTimer = v; }
export function setDisplayedMoney(v: number): void       { displayedMoney = v; }
export function addTotalAppsSubmitted(v: number): void   { totalAppsSubmitted += v; }
