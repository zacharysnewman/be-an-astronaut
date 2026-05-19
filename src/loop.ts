import type { Phase } from './types';
import { state, PROVIDER_PRICE_SETS } from './state';
import {
  lastTimestamp, paperPriceTimer, cloudSaveTimer, warningThrottleTimer,
  totalJobsFound, totalAppsSubmitted, rateJobsSnap, rateAppsSnap, rateTimer,
  setLastTimestamp, setPaperPriceTimer, setCloudSaveTimer, setWarningThrottleTimer,
  addTotalJobsFound, addTotalAppsSubmitted,
  setRateJobsSnap, setRateAppsSnap, setRateTimer, setJobsFoundRate, setAppsSubmittedRate,
} from './state';
import { ui } from './ui';
import { logMessage } from './utils';
import { triggerCloudSave } from './storage';
import { updateUI } from './render';
import { switchTab } from './tabs';

export function transitionToPhase(target: Phase): void {
  if (target === 2) {
    state.phase = 2;
    state.approval = 50.0;
    ui.bankruptcyOverlay.classList.add('hidden');
    logMessage('Macrofirm Interview successfully completed. Assigned Desk 4B. Get to work.', 'promo');
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    switchTab('macrofirm');
  } else {
    state.phase = 1;
    logMessage('Corporate connection severed. Returned to Indebt Jobseeker directory.', 'system');
    switchTab('job-search');
  }
  updateUI();
}

function tickPhase1(dt: number): void {
  let baseRate = 0.01;
  if (state.openClawSubmitLevel >= 1) {
    if (state.selectedProvider === 'finite')        baseRate = 0.01 * state.finiteMultiplier;
    else if (state.selectedProvider === 'weeklink') baseRate = 0.01 * state.weeklinkMultiplier;
    else if (state.selectedProvider === 'bliply')   baseRate = 0.01 * state.bliplyMultiplier;
  }
  const automationFlat = (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02);
  const totalDrain = baseRate + automationFlat;
  state.money -= totalDrain * dt;

  if (state.money <= 0.0) {
    state.money = 0.0;
    if (state.parentalTier === 4) {
      state.money += 9.00;
      state.hasBegged = true;
      logMessage('Automated Script: Direct trust wire injection completed. Directing +$9.00.', 'system');
    }
  }

  const isBankrupt = state.money <= 0.0;

  if (!isBankrupt) {
    const finderVolume = state.openClawFinderLevel > 0 ? Math.pow(3, state.openClawFinderLevel - 1) : 0;
    const jobsGenerated = finderVolume * dt;
    state.availableJobs += jobsGenerated;
    if (jobsGenerated > 0) addTotalJobsFound(jobsGenerated);

    if (state.availableJobs >= 25 && !state.hasUnlockedSubmission) {
      state.hasUnlockedSubmission = true;
      logMessage('Application pipelines activated! Submit engine unlocked.', 'good');
    }

    const submitterVolume = state.openClawSubmitLevel > 0 ? Math.pow(2, state.openClawSubmitLevel - 1) : 0;
    const actualSubmissions = Math.min(submitterVolume * dt, state.availableJobs);
    if (actualSubmissions > 0) {
      state.availableJobs -= actualSubmissions;
      state.applications += actualSubmissions;
      state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
      addTotalAppsSubmitted(actualSubmissions);
    }

    if (state.openClawSubmitLevel >= 1) {
      state.providerTimer -= dt;
      if (state.providerTimer <= 0.0) {
        state.providerTimer = 20.0;
        state.contractLocked = false;

        state.providerPriceIndex = (state.providerPriceIndex + 1) % PROVIDER_PRICE_SETS.length;
        const priceSet = PROVIDER_PRICE_SETS[state.providerPriceIndex];
        state.finiteMultiplier   = priceSet.finite;
        state.weeklinkMultiplier = priceSet.weeklink;
        state.bliplyMultiplier   = priceSet.bliply;

        logMessage('Billing contract window reset. Provider tariffs adjusted.', 'system');
      }
    }
  }
}

function tickPhase2(dt: number): void {
  state.money += (state.level * 0.01) * dt;

  const typistDraftRate = state.typistLevel * 2.0;
  const possibleDrafts = Math.min(typistDraftRate * dt, state.paper);
  if (possibleDrafts > 0) {
    state.paper -= possibleDrafts;
    state.reports += possibleDrafts;
  } else if (state.paper <= 0 && state.typistLevel > 0) {
    if (warningThrottleTimer <= 0) {
      logMessage('Operations Alert: Out of printing paper! Subcontracted typists idling.', 'bad');
      setWarningThrottleTimer(4.0);
    }
  }

  const courierSubRate = state.courierLevel * 2.0;
  const possibleSubmissions = Math.min(courierSubRate * dt, state.reports);
  if (possibleSubmissions > 0) {
    state.reports -= possibleSubmissions;
    state.credibility += possibleSubmissions * 5.0;
  }

  state.credibility -= 1.0 * dt;
  if (state.credibility < 0.0) state.credibility = 0.0;

  state.approval -= 0.5 * dt;
  if (state.approval < 0.0) state.approval = 0.0;

  if (state.procurementUnlocked && state.paper <= 0.02 && state.money >= state.currentPaperPrice) {
    state.money -= state.currentPaperPrice;
    state.paper += 10.0;
  }
}

export function mainLoop(timestamp: number): void {
  let dt = (timestamp - lastTimestamp) / 1000;
  if (dt < 0.0) dt = 0.0;
  if (dt > 1.0) dt = 1.0;
  setLastTimestamp(timestamp);

  if (state.phase === 1) tickPhase1(dt);
  else if (state.phase === 2) tickPhase2(dt);

  setRateTimer(rateTimer + dt);
  if (rateTimer >= 1.0) {
    setJobsFoundRate((totalJobsFound - rateJobsSnap) / rateTimer);
    setAppsSubmittedRate((totalAppsSubmitted - rateAppsSnap) / rateTimer);
    setRateJobsSnap(totalJobsFound);
    setRateAppsSnap(totalAppsSubmitted);
    setRateTimer(0.0);
  }

  setPaperPriceTimer(paperPriceTimer + dt);
  if (paperPriceTimer >= 1.0) {
    setPaperPriceTimer(paperPriceTimer - 1.0);
    const rollState = Math.floor(Math.random() * 3);
    const priceVariation = 0.01 + (Math.random() * 0.03);
    if (rollState === 0)      state.currentPaperPrice = Math.min(0.50, state.currentPaperPrice + priceVariation);
    else if (rollState === 1) state.currentPaperPrice = Math.max(0.10, state.currentPaperPrice - priceVariation);
  }

  setCloudSaveTimer(cloudSaveTimer + dt);
  if (cloudSaveTimer >= 15.0) {
    setCloudSaveTimer(cloudSaveTimer - 15.0);
    triggerCloudSave();
  }

  if (warningThrottleTimer > 0) setWarningThrottleTimer(warningThrottleTimer - dt);

  updateUI();
  requestAnimationFrame(mainLoop);
}
