import type { Phase } from './types';
import { EFFICIENCY_TIER_MULTS, PROCESSOR_COOLDOWN_S } from './constants';
import { tuning } from './tuning';
import { state, PROVIDER_PRICE_SETS } from './state';
import {
  lastTimestamp, paperPriceTimer, cloudSaveTimer, warningThrottleTimer, screeningCooldown, screeningProgress, screeningCredit,
  totalAppsScreened, totalAppsRejected,
  rateAppsScreenedSnap, rateAppsRejectedSnap, rateTimer,
  moneyDisplayTimer,
  setLastTimestamp, setPaperPriceTimer, setCloudSaveTimer, setWarningThrottleTimer, setScreeningCooldown, setScreeningProgress, setScreeningCredit,
  addTotalAppsSubmitted, addTotalAppsScreened, addTotalAppsRejected,
  setRateAppsScreenedSnap, setRateAppsRejectedSnap,
  setRateTimer, setAppsScreenedRate, setAppsRejectedRate,
  setMoneyDisplayTimer, setDisplayedMoney,
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
  const automationFlat = Math.floor(state.openClawSubmitLevel * 0.0025 * 100) / 100;
  const totalDrain = baseRate + automationFlat;
  state.money -= totalDrain * dt;

  if (state.money <= 0.0) {
    state.money = 0.0;
    if (state.parentalTier === 4) {
      state.money += 18.00;
      state.hasBegged = true;
      logMessage('Automated Script: Direct trust wire injection completed. Directing +$18.00.', 'system');
    }
  }

  const isBankrupt = state.money <= 0.0;

  if (!isBankrupt) {
    const effMult = EFFICIENCY_TIER_MULTS[state.efficiencyTier];

    const submitterVolume = state.openClawSubmitLevel * effMult;
    const actualSubmissions = Math.min(submitterVolume * dt, state.availableJobs);
    if (actualSubmissions > 0) {
      state.availableJobs -= actualSubmissions;
      state.applications += actualSubmissions;
      state.unreadApplications += actualSubmissions;
      state.peakAppsSubmitted = Math.max(state.peakAppsSubmitted, state.applications);
      addTotalAppsSubmitted(actualSubmissions);
      state.hasSubmittedApp = true;
    }

    // ATS screening: findability (keywords) drives speed; quality (prettiness) drives pass fraction.
    // Only whole applications are processed — fractional progress accumulates each tick.
    if (screeningCooldown > 0) {
      setScreeningCooldown(screeningCooldown - dt);
    } else {
      const findability = state.keywords * tuning.keywordPenalty;
      const desirability = tuning.qualityBase + state.prettinessLevel * tuning.prettinessQualityBoost;
      setScreeningProgress(screeningProgress + tuning.screeningRateBase * findability * dt);
      const wholeApps = Math.floor(screeningProgress);
      if (wholeApps > 0) {
        setScreeningProgress(screeningProgress - wholeApps);
        const processable = Math.min(wholeApps, Math.floor(state.unreadApplications));
        if (processable > 0) {
          state.unreadApplications -= processable;
          let passThrough = 0;
          let credit = screeningCredit;
          for (let i = 0; i < processable; i++) {
            credit += desirability;
            if (credit >= 1.0) { passThrough++; credit -= 1.0; }
          }
          setScreeningCredit(credit);
          const screenedOut = processable - passThrough;
          if (passThrough > 0) {
            state.appsThruScreening += passThrough;
            state.maxAppsReached = Math.max(state.maxAppsReached, state.appsThruScreening);
            addTotalAppsScreened(passThrough);
            state.hasScreenedApp = true;
          }
          if (screenedOut > 0) {
            state.appsScreenedOut += screenedOut;
            addTotalAppsRejected(screenedOut);
          }
        }
      }
      if (state.unreadApplications <= 0) {
        setScreeningCooldown(PROCESSOR_COOLDOWN_S);
      }
    }

    if (state.openClawSubmitLevel >= 1) {
      state.providerTimer -= dt;
      if (state.providerTimer <= 0.0) {
        state.providerTimer = 60.0;
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
    setAppsScreenedRate((totalAppsScreened - rateAppsScreenedSnap) / rateTimer);
    setAppsRejectedRate((totalAppsRejected - rateAppsRejectedSnap) / rateTimer);
    setRateAppsScreenedSnap(totalAppsScreened);
    setRateAppsRejectedSnap(totalAppsRejected);
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

  setMoneyDisplayTimer(moneyDisplayTimer + dt);
  if (moneyDisplayTimer >= 1.0) {
    setMoneyDisplayTimer(moneyDisplayTimer - 1.0);
    setDisplayedMoney(Math.max(0, state.money));
  }

  updateUI();
  requestAnimationFrame(mainLoop);
}
