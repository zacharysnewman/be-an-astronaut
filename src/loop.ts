import type { Phase } from './types';
import { EFFICIENCY_TIER_MULTS } from './constants';
import { state } from './state';
import { createIndebtPromoEmail } from './emails';
import { initMathQuestion } from './math';
import {
  lastTimestamp, cloudSaveTimer,
  moneyDisplayTimer,
  setLastTimestamp, setCloudSaveTimer,
  addTotalAppsSubmitted,
  setMoneyDisplayTimer, setDisplayedMoney,
} from './state';
import { ui } from './ui';
import { triggerCloudSave } from './storage';
import { updateUI } from './render';
import { switchTab } from './tabs';

export function transitionToPhase(target: Phase): void {
  if (target === 2) {
    state.phase = 2;
    state.approval = 50.0;
    initMathQuestion();
    ui.bankruptcyOverlay.classList.add('hidden');
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    switchTab('macrofirm');
  } else {
    state.phase = 1;
    switchTab('job-search');
  }
  updateUI();
}

function tickPhase1(dt: number): void {
  state.money -= 0.01 * dt;
  if (state.money < 0.0) state.money = 0.0;

  const isBankrupt = state.money <= 0.0;

  if (!isBankrupt) {
    const effMult = EFFICIENCY_TIER_MULTS[state.efficiencyTier];
    const submitterVolume = state.openClawSubmitLevel * effMult;
    const actualSubmissions = Math.min(submitterVolume * dt, state.availableJobs);
    if (actualSubmissions > 0) {
      state.availableJobs -= actualSubmissions;
      state.applications += actualSubmissions;
      state.applyCredits += actualSubmissions;
      state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
      addTotalAppsSubmitted(actualSubmissions);
      state.hasSubmittedApp = true;
    }
  }

  if (state.availableJobs >= 1) {
    state.indebtPromoSent = false;
  } else if (!state.indebtPromoSent && state.money < 1.0) {
    state.indebtPromoSent = true;
    state.emails.push(createIndebtPromoEmail());
  }
}

function tickPhase2(dt: number): void {
  state.money += (state.level * 0.02) * dt;

  state.approval -= 0.5 * dt;
  if (state.approval < 0.0) state.approval = 0.0;
}

export function mainLoop(timestamp: number): void {
  let dt = (timestamp - lastTimestamp) / 1000;
  if (dt < 0.0) dt = 0.0;
  if (dt > 1.0) dt = 1.0;
  setLastTimestamp(timestamp);

  tickPhase1(dt);
  if (state.phase >= 2) tickPhase2(dt);

  setCloudSaveTimer(cloudSaveTimer + dt);
  if (cloudSaveTimer >= 15.0) {
    setCloudSaveTimer(cloudSaveTimer - 15.0);
    triggerCloudSave();
  }

  setMoneyDisplayTimer(moneyDisplayTimer + dt);
  if (moneyDisplayTimer >= 1.0) {
    setMoneyDisplayTimer(moneyDisplayTimer - 1.0);
    setDisplayedMoney(Math.max(0, state.money));
  }

  updateUI();
  requestAnimationFrame(mainLoop);
}
