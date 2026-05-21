import { state, addTotalAppsSubmitted } from './state';
import { ui } from './ui';
import { logMessage, formatMoney, getGeometricCost } from './utils';
import { triggerCloudSave } from './storage';
import { transitionToPhase } from './loop';
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

export function registerEventListeners(): void {
  ui.btnBeg.addEventListener('click', () => {
    if (state.money <= 0.0) {
      state.money += 5.00;
      logMessage('Wired parental bailout capital. Bank balance credited with +$5.00.', 'system');
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
      logMessage(`OpenClaw Auto-Submitter acquired. ${state.openClawSubmitLevel} active. Submitting +1 app/s.`, 'good');
    }
    updateUI();
  });

  const [js1Cost, js2Cost, js3Cost] = JOB_SEARCH_TIER_COSTS;
  const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;

  ui.btnUpgradeJobSearchT1.addEventListener('click', () => {
    if (state.jobSearchTier === 0 && state.applyCredits >= js1Cost) {
      state.applyCredits -= js1Cost;
      state.jobSearchTier = 1;
      logMessage('Job Search Algorithm upgraded to Tier 1. Finding 10x more jobs per search.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT2.addEventListener('click', () => {
    if (state.jobSearchTier === 1 && state.applyCredits >= js2Cost) {
      state.applyCredits -= js2Cost;
      state.jobSearchTier = 2;
      logMessage('Job Search Algorithm upgraded to Tier 2. Finding 100x more jobs per search.', 'good');
    }
    updateUI();
  });

  ui.btnUpgradeJobSearchT3.addEventListener('click', () => {
    if (state.jobSearchTier === 2 && state.applyCredits >= js3Cost) {
      state.applyCredits -= js3Cost;
      state.jobSearchTier = 3;
      logMessage('Job Search Algorithm upgraded to Tier 3. Finding 1,000x more jobs per search.', 'good');
    }
    updateUI();
  });

  ui.btnActionWifi.addEventListener('click', () => {
    if (state.efficiencyTier === 0 && state.applyCredits >= t1Cost) {
      state.applyCredits -= t1Cost;
      state.efficiencyTier = 1;
      logMessage('WiFi router repositioned. Auto-Submitter output at ×2.', 'good');
    }
    updateUI();
  });

  ui.btnActionEthernet.addEventListener('click', () => {
    if (state.efficiencyTier === 1 && state.applyCredits >= t2Cost) {
      state.applyCredits -= t2Cost;
      state.efficiencyTier = 2;
      logMessage('WiFi antennas aimed directly at computer. Auto-Submitter output at ×5.', 'good');
    }
    updateUI();
  });

  ui.btnActionGigabit.addEventListener('click', () => {
    if (state.efficiencyTier === 2 && state.applyCredits >= t3Cost) {
      state.applyCredits -= t3Cost;
      state.efficiencyTier = 3;
      logMessage('Ethernet cable plugged in. Auto-Submitter output at ×10.', 'good');
    }
    updateUI();
  });

  const registerProviderTab = (btn: HTMLButtonElement, keyName: 'finite' | 'weeklink' | 'bliply') => {
    btn.addEventListener('click', () => {
      if (!state.contractLocked) {
        state.selectedProvider = keyName;
        state.contractLocked = true;
        logMessage(`Signed legally-binding contract with ${keyName.toUpperCase()}.`, 'system');
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

      state.emails.push({
        id: 'macrofirm-offer',
        from: 'HR@Macrofirm.com',
        subject: 'Job Offer — Specialist, Macrofirm',
        bodyHtml: `<p>Dear Applicant,</p>
<p>Thank you for your interest in the <b>Specialist</b> position at <b>Macrofirm</b>. After a thorough review of your application materials, we are pleased to extend a formal offer of employment.</p>
<p>You will be assigned to <b>Desk 4B</b>, effective immediately upon acceptance. Compensation is structured at a rate of <b>$0.60&ndash;$1.20/hr</b>, commensurate with corporate grade level.</p>
<p>Please review these terms and click below to confirm your acceptance.</p>`,
        read: false,
        actions: [{ id: 'accept-macrofirm-offer', label: 'Accept Offer', executed: false }],
      });

      setJobCardFading(true);
      ui.jobCard.classList.add('fading-out');
      logMessage('Macrofirm application submitted. Check your Email tab for an offer.', 'promo');
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

  // Email: action buttons (e.g. Accept Offer)
  ui.emailDetailActions.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-action-id]') as HTMLElement | null;
    if (!btn?.dataset.actionId) return;

    if (btn.dataset.actionId === 'accept-macrofirm-offer') {
      const email = state.emails.find(em => em.id === 'macrofirm-offer');
      if (email) {
        const action = email.actions.find(a => a.id === 'accept-macrofirm-offer');
        if (action) action.executed = true;
      }
      setOpenEmailId(null);
      transitionToPhase(2);
    }
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
    logMessage('[DEBUG] Account wiped. Hard set to $0.00.', 'bad');
    updateUI();
  });

  document.getElementById('btn-debug-inject-money')!.addEventListener('click', () => {
    state.money += 1000;
    logMessage('[DEBUG] Injected resources +1000 to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-apps')!.addEventListener('click', () => {
    state.applyCredits += 1000;
    state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
    logMessage('[DEBUG] Injected +1000 Apply Credits to system.', 'system');
    updateUI();
  });

  document.getElementById('btn-debug-inject-unread')!.addEventListener('click', () => {
    state.applications += 1000;
    state.applyCredits += 1000;
    state.maxACReached = Math.max(state.maxACReached, state.applyCredits);
    state.hasSubmittedApp = true;
    logMessage('[DEBUG] Injected +1000 applications to system.', 'system');
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
