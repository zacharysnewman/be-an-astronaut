import type { GameState } from './types';
import { generateProviderPriceSets } from './utils';

export const PROVIDER_PRICE_SETS = generateProviderPriceSets(15);

export const state: GameState = {
  phase: 1,
  money: 1.00,

  availableJobs: 0.0,
  applications: 0.0,
  appsThruScreening: 0.0,
  maxAppsReached: 0.0,
  keywords: 0,
  prettinessLevel: 0,
  hasBegged: false,
  hasUnlockedSubmission: false,
  hasFoundJob: false,
  hasSubmittedApp: false,

  openClawFinderLevel: 0,
  openClawSubmitLevel: 0,
  parentalTier: 1,

  selectedProvider: 'finite',
  contractLocked: false,
  providerTimer: 60.0,
  finiteMultiplier: 1.0,
  weeklinkMultiplier: 1.5,
  bliplyMultiplier: 2.2,
  providerPriceIndex: 0,

  level: 1,
  credibility: 0.0,
  approval: 50.0,
  reports: 0.0,
  paper: 10.0,

  typistLevel: 0,
  courierLevel: 0,
  procurementUnlocked: false,
  efficiencyTier: 0,

  currentPaperPrice: 0.30,
  lastComplimentTime: null,
};

export let lastTimestamp        = performance.now();
export let paperPriceTimer      = 0.0;
export let cloudSaveTimer       = 0.0;
export let warningThrottleTimer = 0.0;
export let moneyDisplayTimer    = 0.0;
export let displayedMoney       = state.money;

export let totalJobsFound     = 0.0;
export let totalAppsSubmitted  = 0.0;
export let rateJobsSnap       = 0.0;
export let rateAppsSnap       = 0.0;
export let rateTimer          = 0.0;
export let jobsFoundRate      = 0.0;
export let appsSubmittedRate  = 0.0;

export function setLastTimestamp(v: number): void        { lastTimestamp = v; }
export function setPaperPriceTimer(v: number): void      { paperPriceTimer = v; }
export function setCloudSaveTimer(v: number): void       { cloudSaveTimer = v; }
export function setWarningThrottleTimer(v: number): void { warningThrottleTimer = v; }
export function setMoneyDisplayTimer(v: number): void    { moneyDisplayTimer = v; }
export function setDisplayedMoney(v: number): void       { displayedMoney = v; }
export function addTotalJobsFound(v: number): void       { totalJobsFound += v; }
export function addTotalAppsSubmitted(v: number): void   { totalAppsSubmitted += v; }
export function setRateJobsSnap(v: number): void         { rateJobsSnap = v; }
export function setRateAppsSnap(v: number): void         { rateAppsSnap = v; }
export function setRateTimer(v: number): void            { rateTimer = v; }
export function setJobsFoundRate(v: number): void        { jobsFoundRate = v; }
export function setAppsSubmittedRate(v: number): void    { appsSubmittedRate = v; }
