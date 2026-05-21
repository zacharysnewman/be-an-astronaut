import { state, addTotalAppsSubmitted, setDisplayedMoney } from './state';
import { ui } from './ui';
import { getGeometricCost } from './utils';
import { triggerCloudSave } from './storage';
import { transitionToPhase } from './loop';
import { showSplash, skipSplash } from './splash';
import { updateUI, setJobCardFading, setOpenEmailId } from './render';
import { switchTab } from './tabs';
import {
  BASE_SUBMITTER_COST,
  BASE_TYPIST_COST,
  BASE_COURIER_COST,
  PROCURE_FIXED_COST,
  EFFICIENCY_TIER_COSTS,
  JOB_SEARCH_TIER_COSTS,
  SAVE_STORAGE_KEY,
} from './constants';
import { createMacrofirmOfferEmail, createZenmoParentalEmail } from './emails';

export function registerEventListeners(): void {
  ui.btnBeg.addEventListener('click', () => {
    if (state.money <= 0.0) {
      const amount = 5.00;
      state.money += amount;
      setDisplayedMoney(state.money);
      state.emails.push(createZenmoParentalEmail(amount, "Love you honey, when you get hungry there's some leftover meatloaf upstairs."));
    }
    updateUI();
  });

  ui.btnFind.addEventListener('click', () => {
    if (state.money >= 1.00) {
      state.money -= 1.00;
      setDisplayedMoney(state.money);
      const mult = Math.pow(10, state.jobSearchTier);
      state.availableJobs = (Math.floor(Math.random() * 101) + 100) * mult;
    }
    updateUI();
  });

  ui.btnApply.addEventListener('click', () => {
    if (state.money > 0 && state.availableJobs >= 1) {
      state.availableJobs -= 1.0;
      state.applications += 1.0;
      state.applyCredits += 1.0;
      state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
      addTotalAppsSubmitted(1.0);
      state.hasSubmittedApp = true;
    }
    updateUI();
  });

  ui.btnUpgradeSubmitter.addEventListener('click', () => {
    const cost = BASE_SUBMITTER_COST * state.openClawSubmitLevel;
    if (state.applyCredits >= cost) {
      state.applyCredits -= cost;
      state.openClawSubmitLevel += 1;
    }
    updateUI();
  });

  const [js1Cost, js2Cost, js3Cost] = JOB_SEARCH_TIER_COSTS;
  const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;

  ui.btnUpgradeJobSearchT1.addEventListener('click', () => {
    if (state.jobSearchTier === 0 && state.applyCredits >= js1Cost) {
      state.applyCredits -= js1Cost;
      state.jobSearchTier = 1;
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT2.addEventListener('click', () => {
    if (state.jobSearchTier === 1 && state.applyCredits >= js2Cost) {
      state.applyCredits -= js2Cost;
      state.jobSearchTier = 2;
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT3.addEventListener('click', () => {
    if (state.jobSearchTier === 2 && state.applyCredits >= js3Cost) {
      state.applyCredits -= js3Cost;
      state.jobSearchTier = 3;
    }
    updateUI();
  });

  ui.btnActionWifi.addEventListener('click', () => {
    if (state.efficiencyTier === 0 && state.applyCredits >= t1Cost) {
      state.applyCredits -= t1Cost;
      state.efficiencyTier = 1;
    }
    updateUI();
  });

  ui.btnActionEthernet.addEventListener('click', () => {
    if (state.efficiencyTier === 1 && state.applyCredits >= t2Cost) {
      state.applyCredits -= t2Cost;
      state.efficiencyTier = 2;
    }
    updateUI();
  });

  ui.btnActionGigabit.addEventListener('click', () => {
    if (state.efficiencyTier === 2 && state.applyCredits >= t3Cost) {
      state.applyCredits -= t3Cost;
      state.efficiencyTier = 3;
    }
    updateUI();
  });

  const registerProviderTab = (btn: HTMLButtonElement, keyName: 'finite' | 'weeklink' | 'bliply') => {
    btn.addEventListener('click', () => {
      if (!state.contractLocked) {
        state.selectedProvider = keyName;
        state.contractLocked = true;
        updateUI();
      }
    });
  };
  registerProviderTab(ui.btnFinite, 'finite');
  registerProviderTab(ui.btnWeeklink, 'weeklink');
  registerProviderTab(ui.btnBliply, 'bliply');

  ui.btnInterview.addEventListener('click', () => {
    if (state.applyCredits >= 100000 && !state.macrofirmApplied) {
      state.applyCredits -= 100000;
      state.macrofirmApplied = true;

      state.emails.push(createMacrofirmOfferEmail());

      setJobCardFading(true);
      ui.jobCard.classList.add('fading-out');
      updateUI();

      setTimeout(() => {
        setJobCardFading(false);
        updateUI();
      }, 1000);
    }
  });

  ui.btnPaper.addEventListener('click', () => {
    if (state.money >= state.currentPaperPrice) {
      state.money -= state.currentPaperPrice;
      setDisplayedMoney(state.money);
      state.paper += 10.0;
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
    }
    updateUI();
  });

  ui.btnCompliment.addEventListener('click', () => {
    const now = Date.now();
    if (!state.lastComplimentTime) {
      state.approval += 10.0;
    } else {
      const diff = (now - state.lastComplimentTime) / 1000;
      if (diff < 5.0) {
        state.approval -= 5.0;
      } else {
        state.approval += 10.0;
      }
    }
    state.lastComplimentTime = now;
    updateUI();
  });

  ui.btnLunch.addEventListener('click', () => {
    if (state.approval >= 80.0) {
      state.level += 1;
      state.approval = 30.0;
    }
    updateUI();
  });

  ui.btnUpgradeTypist.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_TYPIST_COST, 1.5, state.typistLevel);
    if (state.credibility >= cost) {
      state.credibility -= cost;
      state.typistLevel += 1;
    }
    updateUI();
  });

  ui.btnUpgradeCourier.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_COURIER_COST, 1.5, state.courierLevel);
    if (state.credibility >= cost) {
      state.credibility -= cost;
      state.courierLevel += 1;
    }
    updateUI();
  });

  ui.btnUpgradeProcurement.addEventListener('click', () => {
    if (state.credibility >= PROCURE_FIXED_COST && !state.procurementUnlocked) {
      state.credibility -= PROCURE_FIXED_COST;
      state.procurementUnlocked = true;
    }
    updateUI();
  });

  // Tab bar
  ui.tabJobSearch.addEventListener('click', () => switchTab('job-search'));
  ui.tabGoals.addEventListener('click', () => switchTab('goals'));
  ui.tabMacrofirm.addEventListener('click', () => switchTab('macrofirm'));
  ui.tabEmail.addEventListener('click', () => switchTab('email'));

  // Email: back button
  ui.btnEmailBack.addEventListener('click', () => {
    setOpenEmailId(null);
    updateUI();
  });

  // Email: open email from list
  ui.emailList.addEventListener('click', (e) => {
    const row = (e.target as Element).closest('[data-email-id]') as HTMLElement | null;
    if (row?.dataset.emailId) {
      const email = state.emails.find(em => em.id === row.dataset.emailId);
      if (email) email.read = true;
      setOpenEmailId(row.dataset.emailId);
      updateUI();
    }
  });

  // Email: Accept Offer button (static element, direct listener)
  ui.btnAcceptOffer.addEventListener('click', () => {
    const email = state.emails.find(em => em.id === 'macrofirm-offer');
    if (email) {
      const action = email.actions.find(a => a.id === 'accept-macrofirm-offer');
      if (action) action.executed = true;
    }
    setOpenEmailId(null);
    transitionToPhase(2);
  });

  // Email: Indebt.com promo free job search (static element, direct listener)
  ui.btnIndebtPromo.addEventListener('click', () => {
    const promoEmail = state.emails.find(em =>
      em.actions.some(a => a.id === 'indebt-free-search' && !a.executed)
    );
    if (promoEmail) {
      const action = promoEmail.actions.find(a => a.id === 'indebt-free-search');
      if (action) action.executed = true;
    }
    const mult = Math.pow(10, state.jobSearchTier);
    state.availableJobs = (Math.floor(Math.random() * 101) + 100) * mult;
    setOpenEmailId(null);
    switchTab('job-search');
    updateUI();
  });

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
    updateUI();
  });

  document.getElementById('btn-debug-inject-money')!.addEventListener('click', () => {
    state.money += 1000;
    updateUI();
  });

  document.getElementById('btn-debug-inject-apps')!.addEventListener('click', () => {
    state.applyCredits += 1000;
    state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
    updateUI();
  });

  document.getElementById('btn-debug-inject-unread')!.addEventListener('click', () => {
    state.applications += 1000;
    state.applyCredits += 1000;
    state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
    state.hasSubmittedApp = true;
    updateUI();
  });

  document.getElementById('btn-debug-inject-creds')!.addEventListener('click', () => {
    state.credibility += 500;
    updateUI();
  });

  document.getElementById('btn-debug-inject-paper')!.addEventListener('click', () => {
    state.paper += 100;
    updateUI();
  });

  document.getElementById('btn-debug-replay-splash')!.addEventListener('click', () => {
    showSplash();
  });

  document.getElementById('btn-debug-skip-splash')!.addEventListener('click', () => {
    skipSplash();
  });
}
