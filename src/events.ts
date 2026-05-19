import { state, addTotalAppsSubmitted } from './state';
import { ui } from './ui';
import { logMessage, formatMoney, getGeometricCost } from './utils';
import { triggerCloudSave } from './storage';
import { transitionToPhase } from './loop';
import { updateUI } from './render';
import { switchTab } from './tabs';
import {
  BASE_SUBMITTER_COST,
  BASE_TYPIST_COST,
  BASE_COURIER_COST,
  PROCURE_FIXED_COST,
  EFFICIENCY_TIER_COSTS,
  JOB_SEARCH_TIER_COSTS,
  PRETTIFY_TIER_COSTS,
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
      if (state.appsThruScreening >= 50) {
        state.appsThruScreening -= 50;
        state.money += pAmount;
        state.hasBegged = true;
        logMessage(`Exchanged screened applications to secure parent wire transfer of +$${pAmount.toFixed(2)}.`, 'system');
      }
    }
    updateUI();
  });

  ui.btnFind.addEventListener('click', () => {
    if (state.money >= 1.00) {
      state.money -= 1.00;
      const mult = Math.pow(10, state.jobSearchTier);
      state.availableJobs = (Math.floor(Math.random() * 101) + 100) * mult;
    }
    updateUI();
  });

  ui.btnApply.addEventListener('click', () => {
    if (state.money > 0 && state.availableJobs >= 1) {
      state.availableJobs -= 1.0;
      state.applications += 1.0;
      state.unreadApplications += 1.0;
      state.peakAppsSubmitted = Math.max(state.peakAppsSubmitted, state.applications);
      addTotalAppsSubmitted(1.0);
      state.hasSubmittedApp = true;
    }
    updateUI();
  });

  ui.btnUpgradeSubmitter.addEventListener('click', () => {
    const cost = BASE_SUBMITTER_COST * state.openClawSubmitLevel;
    if (state.appsThruScreening >= cost) {
      state.appsThruScreening -= cost;
      state.openClawSubmitLevel += 1;
      logMessage(`OpenClaw Auto-Submitter acquired. ${state.openClawSubmitLevel} active. Submitting +1 app/s.`, 'good');
    }
    updateUI();
  });

  ui.btnKeywordsDown.addEventListener('click', () => {
    if (state.keywords > 0) state.keywords -= 1;
    updateUI();
  });

  ui.btnKeywordsUp.addEventListener('click', () => {
    state.keywords += 1;
    updateUI();
  });

  const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;
  const [js1Cost, js2Cost, js3Cost] = JOB_SEARCH_TIER_COSTS;
  const [p1Cost, p2Cost, p3Cost, p4Cost] = PRETTIFY_TIER_COSTS;

  ui.btnUpgradePrettifyT1.addEventListener('click', () => {
    if (state.prettinessLevel === 0 && state.appsThruScreening >= p1Cost) {
      state.appsThruScreening -= p1Cost;
      state.prettinessLevel = 1;
      logMessage('Resume reformatted with professional layout. Desirability increased.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradePrettifyT2.addEventListener('click', () => {
    if (state.prettinessLevel === 1 && state.appsThruScreening >= p2Cost) {
      state.appsThruScreening -= p2Cost;
      state.prettinessLevel = 2;
      logMessage('Resume enhanced with curated achievements section. Desirability increased.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradePrettifyT3.addEventListener('click', () => {
    if (state.prettinessLevel === 2 && state.appsThruScreening >= p3Cost) {
      state.appsThruScreening -= p3Cost;
      state.prettinessLevel = 3;
      logMessage('Resume polished with executive summary and metrics. Desirability increased.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradePrettifyT4.addEventListener('click', () => {
    if (state.prettinessLevel === 3 && state.appsThruScreening >= p4Cost) {
      state.appsThruScreening -= p4Cost;
      state.prettinessLevel = 4;
      logMessage('Resume perfected with portfolio links and testimonials. Desirability maximized.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeEfficiencyT1.addEventListener('click', () => {
    if (state.efficiencyTier === 0 && state.appsThruScreening >= t1Cost) {
      state.appsThruScreening -= t1Cost;
      state.efficiencyTier = 1;
      logMessage('OpenClaw Efficiency Protocol Tier 1 engaged. Automation output doubled (+100%).', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeEfficiencyT2.addEventListener('click', () => {
    if (state.efficiencyTier === 1 && state.appsThruScreening >= t2Cost) {
      state.appsThruScreening -= t2Cost;
      state.efficiencyTier = 2;
      logMessage('OpenClaw Efficiency Protocol Tier 2 engaged. Automation output at +150%.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeEfficiencyT3.addEventListener('click', () => {
    if (state.efficiencyTier === 2 && state.appsThruScreening >= t3Cost) {
      state.appsThruScreening -= t3Cost;
      state.efficiencyTier = 3;
      logMessage('OpenClaw Efficiency Protocol Tier 3 engaged. Automation output at +300%.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT1.addEventListener('click', () => {
    if (state.jobSearchTier === 0 && state.appsThruScreening >= js1Cost) {
      state.appsThruScreening -= js1Cost;
      state.jobSearchTier = 1;
      logMessage('Job Search Algorithm upgraded to Tier 1. Finding 10x more jobs per search.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT2.addEventListener('click', () => {
    if (state.jobSearchTier === 1 && state.appsThruScreening >= js2Cost) {
      state.appsThruScreening -= js2Cost;
      state.jobSearchTier = 2;
      logMessage('Job Search Algorithm upgraded to Tier 2. Finding 100x more jobs per search.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT3.addEventListener('click', () => {
    if (state.jobSearchTier === 2 && state.appsThruScreening >= js3Cost) {
      state.appsThruScreening -= js3Cost;
      state.jobSearchTier = 3;
      logMessage('Job Search Algorithm upgraded to Tier 3. Finding 1,000x more jobs per search.', 'good');
    }
    updateUI();
  });

  const registerProviderTab = (btn: HTMLButtonElement, keyName: 'finite' | 'weeklink' | 'bliply') => {
    btn.addEventListener('click', () => {
      if (!state.contractLocked) {
        state.selectedProvider = keyName;
        state.contractLocked = true;

        const baseVal = Math.max(0.01, state.openClawSubmitLevel * 0.02);
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
    if (state.appsThruScreening >= 2000 && state.parentalTier === 1) {
      state.appsThruScreening -= 2000;
      state.parentalTier = 2;
      logMessage('Parental Trust optimized to Tier 2. Emergency wire allowance increased to $12.00.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeParentT3.addEventListener('click', () => {
    if (state.appsThruScreening >= 4000 && state.parentalTier === 2) {
      state.appsThruScreening -= 4000;
      state.parentalTier = 3;
      logMessage('Parental Trust optimized to Tier 3. Elite family trust wires $18.00.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeParentT4.addEventListener('click', () => {
    if (state.appsThruScreening >= 50000 && state.parentalTier === 3) {
      state.appsThruScreening -= 50000;
      state.parentalTier = 4;
      logMessage('Automatic background banking loops initialized. Family allowance automated.', 'good');
    }
    updateUI();
  });

  ui.btnInterview.addEventListener('click', () => {
    if (state.appsThruScreening >= 100000) {
      state.appsThruScreening -= 100000;
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
    state.appsThruScreening += 1000;
    state.maxAppsReached = Math.max(state.maxAppsReached, state.appsThruScreening);
    logMessage('[DEBUG] Injected +1000 screened apps to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-unread')!.addEventListener('click', () => {
    state.unreadApplications += 1000;
    logMessage('[DEBUG] Injected +1000 unread applications to ATS buffer.', 'system');
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
