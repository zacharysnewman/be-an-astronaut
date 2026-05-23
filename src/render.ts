import { state, displayedMoney, totalAppsSubmitted } from './state';
import { ui } from './ui';
import { formatMoney } from './utils';
import {
  BASE_SUBMITTER_COST,
  EFFICIENCY_TIER_COSTS,
  JOB_SEARCH_TIER_COSTS,
} from './constants';
import { getCurrentQuestion } from './math';

const formatComma = (val: number) => Math.floor(val).toLocaleString('en-US');

function shouldShowUpgrade(maxResource: number, cost: number, purchased: boolean): boolean {
  return !purchased && maxResource >= cost * 0.25;
}

// Tracks whether the job card is mid-fade so render doesn't force-hide it
let jobCardFading = false;
export function setJobCardFading(v: boolean): void { jobCardFading = v; }

// Which email is currently open in the detail view (null = list view)
let openEmailId: string | null = null;
export function setOpenEmailId(id: string | null): void { openEmailId = id; }

// Tracks last email rendered in detail view to skip redundant innerHTML writes
let lastDetailEmailId: string | null = null;

function renderPhase1(): void {
  ui.income.innerText = '-$0.01/s';
  ui.income.classList.add('bad');
  ui.income.classList.remove('good');
  ui.headerFees.innerText = '-$0.01/s';
  ui.headerFees.className = 'bad';

  ui.availJobs.innerText = formatComma(state.availableJobs);

  ui.applyCreditsDisplay.innerText = formatComma(state.applyCredits);

  ui.btnFind.disabled = state.money < 1.00;
  ui.btnApply.disabled = state.money <= 0 || state.availableJobs < 1;

  ui.totalReadDisplay.innerText = formatComma(totalAppsSubmitted);

  // Job Search tier upgrades
  const [js1Cost, js2Cost, js3Cost] = JOB_SEARCH_TIER_COSTS;
  ui.upgradeJobSearchT1Row.classList.toggle('hidden',
    !shouldShowUpgrade(state.maxACReached, js1Cost, state.jobSearchTier >= 1));
  ui.upgradeJobSearchT2Row.classList.toggle('hidden',
    state.jobSearchTier < 1 || !shouldShowUpgrade(state.maxACReached, js2Cost, state.jobSearchTier >= 2));
  ui.upgradeJobSearchT3Row.classList.toggle('hidden',
    state.jobSearchTier < 2 || !shouldShowUpgrade(state.maxACReached, js3Cost, state.jobSearchTier >= 3));
  ui.btnUpgradeJobSearchT1.disabled = state.applyCredits < js1Cost;
  ui.btnUpgradeJobSearchT2.disabled = state.applyCredits < js2Cost;
  ui.btnUpgradeJobSearchT3.disabled = state.applyCredits < js3Cost;

  // Auto-Submitter row (in job search section)
  ui.upgradeSubmitterRow.classList.toggle('hidden', state.applications < 25);
  const submitterCost = BASE_SUBMITTER_COST * state.openClawSubmitLevel;
  ui.submitterBadge.innerText = String(state.openClawSubmitLevel);
  ui.submitterCostDisplay.innerText = formatComma(submitterCost);
  ui.btnUpgradeSubmitter.disabled = state.applyCredits < submitterCost;

  // Actions section (automation upgrades)
  ui.actionsSection.classList.toggle('hidden', state.openClawSubmitLevel < 1);

  const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;
  ui.actionWifiRow.classList.toggle('hidden',
    !shouldShowUpgrade(state.maxACReached, t1Cost, state.efficiencyTier >= 1));
  ui.actionEthernetRow.classList.toggle('hidden',
    state.efficiencyTier < 1 || !shouldShowUpgrade(state.maxACReached, t2Cost, state.efficiencyTier >= 2));
  ui.actionGigabitRow.classList.toggle('hidden',
    state.efficiencyTier < 2 || !shouldShowUpgrade(state.maxACReached, t3Cost, state.efficiencyTier >= 3));
  ui.btnActionWifi.disabled    = state.applyCredits < t1Cost;
  ui.btnActionEthernet.disabled = state.applyCredits < t2Cost;
  ui.btnActionGigabit.disabled  = state.applyCredits < t3Cost;

  // Service provider section is disabled
  ui.providerContainer.classList.add('hidden');

  // Job card: only show when revealed and not yet applied; skip toggling hidden during fade
  if (!jobCardFading) {
    if (state.maxACReached >= 10000 && !state.macrofirmApplied) {
      ui.jobCard.classList.remove('hidden');
      ui.btnInterview.disabled = state.applyCredits < 100000;
    } else {
      ui.jobCard.classList.add('hidden');
    }
  }

  ui.dbFiniteMult.innerText   = state.finiteMultiplier.toFixed(2);
  ui.dbWeeklinkMult.innerText = state.weeklinkMultiplier.toFixed(2);
  ui.dbBliplyMult.innerText   = state.bliplyMultiplier.toFixed(2);
}

function renderPhase2(): void {
  const salary = state.level * 0.02;
  const net = salary - 0.01;
  const netStr = net >= 0 ? `+${formatMoney(net)}/s` : `${formatMoney(net)}/s`;
  ui.income.innerText = netStr;
  ui.income.classList.toggle('bad', net < 0);
  ui.income.classList.toggle('good', net >= 0);
  ui.headerFees.innerText = netStr;
  ui.headerFees.className = net >= 0 ? 'good' : 'bad';

  ui.level.innerText         = String(state.level);
  ui.appr.innerText          = state.approval.toFixed(0);
  ui.customerPoints.innerText = Math.floor(state.customerPoints).toLocaleString('en-US');

  ui.btnLunch.classList.toggle('hidden', state.approval < 80);

  if (state.lastComplimentTime) {
    const passed = ((Date.now() - state.lastComplimentTime) / 1000).toFixed(1);
    ui.timer.innerText = `Manager Status: Wait ${passed}s`;
    ui.timer.classList.toggle('bad', parseFloat(passed) < 5.0);
  } else {
    ui.timer.innerText = 'Manager Status: Stable';
  }

  const q = getCurrentQuestion();
  if (q) ui.mathQuestionText.innerText = q.text;
}

function renderGoals(): void {
  const jobDone = state.phase >= 2;
  ui.goalGetJob.classList.toggle('goal-done', jobDone);
  ui.goalCheckJob.innerText = jobDone ? '☑' : '☐';
}

function renderEmail(): void {
  const unreadCount = state.emails.filter(e => !e.read).length;
  ui.tabEmail.textContent = unreadCount > 0 ? `Mail.com (${unreadCount})` : 'Mail.com';

  if (ui.emailContainer.classList.contains('hidden')) return;

  if (openEmailId) {
    const email = state.emails.find(e => e.id === openEmailId);
    if (!email) {
      openEmailId = null;
    } else {
      ui.emailListView.classList.add('hidden');
      ui.emailDetailView.classList.remove('hidden');

      // Only write to the DOM when the email actually changes
      if (lastDetailEmailId !== email.id) {
        ui.emailDetailFrom.textContent = `From: ${email.from}`;
        ui.emailDetailSubject.textContent = email.subject;
        ui.emailDetailBody.innerHTML = email.bodyHtml;
        lastDetailEmailId = email.id;
      }

      // Show/hide static action buttons based on current email's actions
      const offerAction = email.actions.find(a => a.id === 'accept-macrofirm-offer');
      ui.btnAcceptOffer.classList.toggle('hidden', !offerAction || offerAction.executed);

      const promoAction = email.actions.find(a => a.id === 'indebt-free-search');
      ui.btnIndebtPromo.classList.toggle('hidden', !promoAction || promoAction.executed);
      return;
    }
  }

  lastDetailEmailId = null;
  ui.btnAcceptOffer.classList.add('hidden');
  ui.btnIndebtPromo.classList.add('hidden');

  // List view
  ui.emailListView.classList.remove('hidden');
  ui.emailDetailView.classList.add('hidden');

  ui.emailList.innerHTML = '';
  if (state.emails.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'italic';
    empty.textContent = 'No messages.';
    ui.emailList.appendChild(empty);
  } else {
    for (const email of [...state.emails].reverse()) {
      const row = document.createElement('div');
      row.className = 'email-row' + (email.read ? '' : ' email-row-unread');
      row.dataset.emailId = email.id;

      const from = document.createElement('span');
      from.className = 'email-from';
      from.textContent = email.from;

      const subject = document.createElement('span');
      subject.className = 'email-row-subject';
      subject.textContent = email.subject;

      row.appendChild(from);
      row.appendChild(subject);
      ui.emailList.appendChild(row);
    }
  }
}

export function updateUI(): void {
  const isBankrupt = state.phase === 1 && state.money <= 0.0;
  ui.money.innerText = formatMoney(isBankrupt ? 0 : displayedMoney);

  ui.tabMacrofirm.classList.toggle('hidden', state.phase < 2);

  if (isBankrupt) {
    ui.money.classList.add('flashing-bankrupt');
    ui.bankruptcyOverlay.classList.remove('hidden');
    document.body.classList.add('overlay-active');
  } else {
    ui.money.classList.remove('flashing-bankrupt');
    ui.bankruptcyOverlay.classList.add('hidden');
    document.body.classList.remove('overlay-active');
  }

  ui.btnBeg.disabled = !isBankrupt;

  renderGoals();
  renderPhase1();
  if (state.phase >= 2) renderPhase2();
  renderEmail();
}
