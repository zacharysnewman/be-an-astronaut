import { state, addTotalJobsFound, addTotalAppsSubmitted } from './state';
import { ui } from './ui';
import { logMessage, formatMoney, getLinearCost, getGeometricCost } from './utils';
import { triggerCloudSave } from './storage';
import { transitionToPhase } from './loop';
import { updateUI } from './render';
import { switchTab } from './tabs';
import {
  BASE_FINDER_COST,
  BASE_SUBMITTER_COST,
  BASE_TYPIST_COST,
  BASE_COURIER_COST,
  PROCURE_FIXED_COST,
  SAVE_STORAGE_KEY,
} from './constants';

export function registerEventListeners(): void {
  ui.btnBeg.addEventListener('click', () => {
    let pAmount = 5.00;
    if (state.parentalTier === 2) pAmount = 12.00;
    if (state.parentalTier >= 3)  pAmount = 18.00;

    if (state.money <= 0.0) {
      state.money += pAmount;
      state.hasBegged = true;
      logMessage(`Wired parental bailout capital. Bank balance credited with +$${pAmount.toFixed(2)}.`, 'system');
    } else {
      if (state.applications >= 50) {
        state.applications -= 50;
        state.money += pAmount;
        state.hasBegged = true;
        logMessage(`Exchanged submitted pipelines to secure parent wire transfer of +$${pAmount.toFixed(2)}.`, 'system');
      }
    }
    updateUI();
  });

  ui.btnFind.addEventListener('click', () => {
    if (state.money > 0) {
      state.availableJobs += 1.0;
      state.hasFoundJob = true;
      addTotalJobsFound(1.0);
      if (state.availableJobs >= 25 && !state.hasUnlockedSubmission) {
        state.hasUnlockedSubmission = true;
        logMessage('Application pipelines activated! Submit engine unlocked.', 'good');
      }
    }
    updateUI();
  });

  ui.btnApply.addEventListener('click', () => {
    if (state.money > 0 && state.availableJobs >= 1) {
      state.availableJobs -= 1.0;
      state.applications += 1.0;
      state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
      addTotalAppsSubmitted(1.0);
      state.hasSubmittedApp = true;
    }
    updateUI();
  });

  ui.btnUpgradeFinder.addEventListener('click', () => {
    const cost = getLinearCost(BASE_FINDER_COST, state.openClawFinderLevel);
    if (state.applications >= cost) {
      state.applications -= cost;
      state.openClawFinderLevel += 1;
      logMessage(`OpenClaw Auto-Finder acquired. ${state.openClawFinderLevel} active. Finding +1 job/s.`, 'good');
    }
    updateUI();
  });

  ui.btnUpgradeSubmitter.addEventListener('click', () => {
    const cost = getLinearCost(BASE_SUBMITTER_COST, state.openClawSubmitLevel);
    if (state.applications >= cost) {
      state.applications -= cost;
      state.openClawSubmitLevel += 1;
      logMessage(`OpenClaw Auto-Submitter acquired. ${state.openClawSubmitLevel} active. Submitting +1 app/s.`, 'good');
    }
    updateUI();
  });

  ui.btnUpgradeEfficiency.addEventListener('click', () => {
    if (!state.efficiencyUnlocked && state.applications >= 1000) {
      state.applications -= 1000;
      state.efficiencyUnlocked = true;
      logMessage('OpenClaw Efficiency Protocol engaged. All automation output doubled.', 'good');
    }
    updateUI();
  });

  const registerProviderTab = (btn: HTMLButtonElement, keyName: 'finite' | 'weeklink' | 'bliply') => {
    btn.addEventListener('click', () => {
      if (!state.contractLocked) {
        state.selectedProvider = keyName;
        state.contractLocked = true;

        const baseVal = Math.max(0.01, (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02));
        let mult = 1.0;
        if (keyName === 'finite')        mult = state.finiteMultiplier;
        else if (keyName === 'weeklink') mult = state.weeklinkMultiplier;
        else if (keyName === 'bliply')   mult = state.bliplyMultiplier;

        logMessage(`Signed legally-binding 20s contract with ${keyName.toUpperCase()} at $${(baseVal * mult).toFixed(4)}/s.`, 'system');
        updateUI();
      }
    });
  };
  registerProviderTab(ui.btnFinite, 'finite');
  registerProviderTab(ui.btnWeeklink, 'weeklink');
  registerProviderTab(ui.btnBliply, 'bliply');

  ui.btnUpgradeParentT2.addEventListener('click', () => {
    if (state.applications >= 2000 && state.parentalTier === 1) {
      state.applications -= 2000;
      state.parentalTier = 2;
      logMessage('Parental Trust optimized to Tier 2. Emergency wire allowance increased to $12.00.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeParentT3.addEventListener('click', () => {
    if (state.applications >= 4000 && state.parentalTier === 2) {
      state.applications -= 4000;
      state.parentalTier = 3;
      logMessage('Parental Trust optimized to Tier 3. Elite family trust wires $18.00.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeParentT4.addEventListener('click', () => {
    if (state.applications >= 50000 && state.parentalTier === 3) {
      state.applications -= 50000;
      state.parentalTier = 4;
      logMessage('Automatic background banking loops initialized. Family allowance automated.', 'good');
    }
    updateUI();
  });

  ui.btnInterview.addEventListener('click', () => {
    if (state.applications >= 100000) {
      state.applications -= 100000;
      transitionToPhase(2);
    }
  });

  ui.btnPaper.addEventListener('click', () => {
    if (state.money >= state.currentPaperPrice) {
      state.money -= state.currentPaperPrice;
      state.paper += 10.0;
      logMessage(`Acquired printing ream sheets at market rate of ${formatMoney(state.currentPaperPrice)}.`, 'good');
    }
    updateUI();
  });

  ui.btnWrite.addEventListener('click', () => {
    if (state.paper >= 1.0) {
      state.paper -= 1.0;
      state.reports += 1.0;
    }
    updateUI();
  });

  ui.btnSubmit.addEventListener('click', () => {
    if (state.reports >= 1.0) {
      state.reports -= 1.0;
      state.credibility += 5.0;
      logMessage('Administrative logs handed off. Supervisor credibility upgraded.');
    }
    updateUI();
  });

  ui.btnCompliment.addEventListener('click', () => {
    const now = Date.now();
    if (!state.lastComplimentTime) {
      state.approval += 10.0;
      logMessage("Lauded supervisor's coordinate tie palette.", 'good');
    } else {
      const diff = (now - state.lastComplimentTime) / 1000;
      if (diff < 5.0) {
        state.approval -= 5.0;
        logMessage("You're lingering around the supervisor's desk too aggressively.", 'bad');
      } else {
        state.approval += 10.0;
        logMessage("Expressed elegant technical alignment with supervisor's draft.", 'good');
      }
    }
    state.lastComplimentTime = now;
    updateUI();
  });

  ui.btnLunch.addEventListener('click', () => {
    if (state.approval >= 80.0) {
      state.level += 1;
      state.approval = 30.0;
      logMessage(`Attended office banquet. Promoted to Grade Level ${state.level}. Salary rate buffed.`, 'promo');
    }
    updateUI();
  });

  ui.btnUpgradeTypist.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_TYPIST_COST, 1.5, state.typistLevel);
    if (state.credibility >= cost) {
      state.credibility -= cost;
      state.typistLevel += 1;
      logMessage(`Enlisted Subcontracted Typist (Level ${state.typistLevel}) to handle documentation drafting.`, 'good');
    }
    updateUI();
  });

  ui.btnUpgradeCourier.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_COURIER_COST, 1.5, state.courierLevel);
    if (state.credibility >= cost) {
      state.credibility -= cost;
      state.courierLevel += 1;
      logMessage(`Deployed HR Courier Line (Level ${state.courierLevel}) for automated submissions.`, 'good');
    }
    updateUI();
  });

  ui.btnUpgradeProcurement.addEventListener('click', () => {
    if (state.credibility >= PROCURE_FIXED_COST && !state.procurementUnlocked) {
      state.credibility -= PROCURE_FIXED_COST;
      state.procurementUnlocked = true;
      logMessage('Background procurement script online. Automated printing ream restocking functional.', 'good');
    }
    updateUI();
  });

  // Tab bar
  ui.tabJobSearch.addEventListener('click', () => switchTab('job-search'));
  ui.tabGoals.addEventListener('click', () => switchTab('goals'));
  ui.tabMacrofirm.addEventListener('click', () => switchTab('macrofirm'));

  // Debug panel
  document.getElementById('debug-toggle')!.addEventListener('click', () => {
    ui.debugPanel.classList.toggle('hidden');
  });

  document.getElementById('btn-debug-save')!.addEventListener('click', () => {
    triggerCloudSave(true);
  });

  document.getElementById('btn-debug-reset')!.addEventListener('click', () => {
    if (confirm('Execute master database wipe? All progress will revert to zero.')) {
      localStorage.removeItem(SAVE_STORAGE_KEY);
      location.reload();
    }
  });

  document.getElementById('btn-debug-toggle-phase')!.addEventListener('click', () => {
    if (state.phase === 1) transitionToPhase(2);
    else transitionToPhase(1);
  });

  document.getElementById('btn-debug-zero-money')!.addEventListener('click', () => {
    state.money = 0.00;
    logMessage('[DEBUG] Account wiped. Hard set to $0.00.', 'bad');
    updateUI();
  });

  document.getElementById('btn-debug-inject-money')!.addEventListener('click', () => {
    state.money += 1000;
    logMessage('[DEBUG] Injected resources +1000 to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-apps')!.addEventListener('click', () => {
    state.applications += 1000;
    state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
    logMessage('[DEBUG] Injected resources +1000 to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-creds')!.addEventListener('click', () => {
    state.credibility += 500;
    logMessage('[DEBUG] Injected resources +500 to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-paper')!.addEventListener('click', () => {
    state.paper += 100;
    logMessage('[DEBUG] Injected resources +100 to system.', 'system');
    updateUI();
  });
}
