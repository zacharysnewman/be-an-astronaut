import { state, jobsFoundRate, appsSubmittedRate, appsScreenedRate, displayedMoney, totalAppsSubmitted } from './state';
import { ui } from './ui';
import { formatMoney, getLinearCost, getGeometricCost } from './utils';
import {
  BASE_FINDER_COST,
  BASE_SUBMITTER_COST,
  BASE_TYPIST_COST,
  BASE_COURIER_COST,
  PROCURE_FIXED_COST,
  EFFICIENCY_TIER_COSTS,
} from './constants';

const formatComma = (val: number) => Math.floor(val).toLocaleString('en-US');

// An upgrade row is shown when the player has ever reached 25% of its cost,
// and hidden once the upgrade has been purchased.
function shouldShowUpgrade(maxResource: number, cost: number, purchased: boolean): boolean {
  return !purchased && maxResource >= cost * 0.25;
}

function renderPhase1(): void {
  let baseRate = 0.01;
  if (state.openClawSubmitLevel >= 1) {
    if (state.selectedProvider === 'finite')        baseRate = 0.01 * state.finiteMultiplier;
    else if (state.selectedProvider === 'weeklink') baseRate = 0.01 * state.weeklinkMultiplier;
    else if (state.selectedProvider === 'bliply')   baseRate = 0.01 * state.bliplyMultiplier;
  }
  const automationFlat = Math.floor((state.openClawFinderLevel + state.openClawSubmitLevel) * 0.0025 * 100) / 100;
  const totalDrain = baseRate + automationFlat;
  ui.income.innerText = `${formatMoney(-totalDrain)}/s`;
  ui.income.classList.add('bad');
  ui.income.classList.remove('good');
  ui.headerFees.innerText = ui.income.innerText;
  ui.headerFees.className = 'bad';

  ui.totalAppsDisplay.innerText = formatComma(totalAppsSubmitted);
  ui.availJobs.innerText = formatComma(state.availableJobs);
  ui.apps.innerText = formatComma(state.applications);
  ui.unreadAppsDisplay.innerText = formatComma(state.unreadApplications);
  ui.appsThruScreeningDisplay.innerText = formatComma(state.appsThruScreening);

  if (state.hasFoundJob) {
    ui.finderRateRow.classList.remove('hidden');
    ui.finderRateDisplay.innerText = `+${jobsFoundRate.toFixed(1)}`;
  } else {
    ui.finderRateRow.classList.add('hidden');
  }

  if (state.hasSubmittedApp) {
    ui.submitterRateRow.classList.remove('hidden');
    ui.submitterRateDisplay.innerText = `+${appsSubmittedRate.toFixed(1)}`;
  } else {
    ui.submitterRateRow.classList.add('hidden');
  }

  // ATS screening section — visible once the player owns at least one Auto-Finder AND one Auto-Submitter
  const showScreening = state.openClawFinderLevel >= 1 && state.openClawSubmitLevel >= 1;
  ui.keywordsSection.classList.toggle('hidden', !showScreening);

  ui.keywordsDisplay.innerText = String(state.keywords);
  ui.btnKeywordsDown.disabled = state.keywords <= 0;
  if (state.hasScreenedApp) {
    ui.screeningRateRow.classList.remove('hidden');
    ui.screeningRateDisplay.innerText = `+${appsScreenedRate.toFixed(1)}`;
  } else {
    ui.screeningRateRow.classList.add('hidden');
  }

  ui.btnFind.disabled = state.money <= 0;
  ui.btnApply.disabled = state.money <= 0 || state.availableJobs < 1;

  ui.inlineAppRow.classList.toggle('hidden', !state.hasUnlockedSubmission);

  ui.automationCardP1.classList.toggle('hidden', state.maxAppsReached < (0.25 * BASE_FINDER_COST));

  const finderCost = getLinearCost(BASE_FINDER_COST, state.openClawFinderLevel);
  ui.finderBadge.innerText = String(state.openClawFinderLevel);
  ui.finderCostDisplay.innerText = formatComma(finderCost);
  ui.btnUpgradeFinder.disabled = state.applications < finderCost;

  if (state.openClawFinderLevel > 1) {
    ui.upgradeSubmitterRow.classList.remove('hidden');
    const submitterCost = getLinearCost(BASE_SUBMITTER_COST, state.openClawSubmitLevel);
    ui.submitterBadge.innerText = String(state.openClawSubmitLevel);
    ui.submitterCostDisplay.innerText = formatComma(submitterCost);
    ui.btnUpgradeSubmitter.disabled = state.applications < submitterCost;

    const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;
    ui.upgradeEfficiencyT1Row.classList.toggle('hidden',
      !shouldShowUpgrade(state.maxAppsReached, t1Cost, state.efficiencyTier >= 1));
    ui.upgradeEfficiencyT2Row.classList.toggle('hidden',
      !shouldShowUpgrade(state.maxAppsReached, t2Cost, state.efficiencyTier >= 2));
    ui.upgradeEfficiencyT3Row.classList.toggle('hidden',
      !shouldShowUpgrade(state.maxAppsReached, t3Cost, state.efficiencyTier >= 3));

    ui.btnUpgradeEfficiencyT1.disabled = state.applications < t1Cost;
    ui.btnUpgradeEfficiencyT2.disabled = state.applications < t2Cost;
    ui.btnUpgradeEfficiencyT3.disabled = state.applications < t3Cost;
  } else {
    ui.upgradeSubmitterRow.classList.add('hidden');
    ui.upgradeEfficiencyT1Row.classList.add('hidden');
    ui.upgradeEfficiencyT2Row.classList.add('hidden');
    ui.upgradeEfficiencyT3Row.classList.add('hidden');
  }

  // Service provider section is disabled for now
  ui.providerContainer.classList.add('hidden');

  ui.parentalUpgradesContainer.classList.add('hidden');

  if (state.maxAppsReached >= 10000) {
    ui.jobCard.classList.remove('hidden');
    ui.btnInterview.disabled = state.applications < 100000;
  } else {
    ui.jobCard.classList.add('hidden');
  }

  ui.dbFiniteMult.innerText   = state.finiteMultiplier.toFixed(2);
  ui.dbWeeklinkMult.innerText = state.weeklinkMultiplier.toFixed(2);
  ui.dbBliplyMult.innerText   = state.bliplyMultiplier.toFixed(2);
}

function renderPhase2(): void {
  const hourlySalary = state.level * 0.01;
  ui.income.innerText = `+${formatMoney(hourlySalary)}/s`;
  ui.income.classList.remove('bad');
  ui.income.classList.add('good');
  ui.headerFees.innerText = ui.income.innerText;
  ui.headerFees.className = 'good';

  ui.level.innerText   = String(state.level);
  ui.appr.innerText    = state.approval.toFixed(0);
  ui.paper.innerText   = state.paper.toFixed(1);
  ui.reports.innerText = String(Math.floor(state.reports));
  ui.perf.innerText    = state.credibility.toFixed(0);

  ui.paperCostDisplay.innerText = formatMoney(state.currentPaperPrice);
  ui.btnPaper.disabled  = state.money < state.currentPaperPrice;
  ui.btnWrite.disabled  = state.paper < 1;
  ui.btnSubmit.disabled = state.reports < 1;

  ui.btnLunch.classList.toggle('hidden', state.approval < 80);

  if (state.typistLevel > 0 || state.courierLevel > 0) {
    ui.reportRate.innerText = `+${state.typistLevel * 2}/s | -${state.courierLevel * 2}/s`;
  } else {
    ui.reportRate.innerText = '';
  }

  if (state.lastComplimentTime) {
    const passed = ((Date.now() - state.lastComplimentTime) / 1000).toFixed(1);
    ui.timer.innerText = `Manager Status: Wait ${passed}s`;
    ui.timer.classList.toggle('bad', parseFloat(passed) < 5.0);
  } else {
    ui.timer.innerText = 'Manager Status: Stable';
  }

  const typistCost = getGeometricCost(BASE_TYPIST_COST, 1.5, state.typistLevel);
  ui.typistBadge.innerText       = String(state.typistLevel);
  ui.typistCostDisplay.innerText = formatComma(typistCost);
  ui.btnUpgradeTypist.disabled   = state.credibility < typistCost;

  const courierCost = getGeometricCost(BASE_COURIER_COST, 1.5, state.courierLevel);
  ui.courierBadge.innerText       = String(state.courierLevel);
  ui.courierCostDisplay.innerText = formatComma(courierCost);
  ui.btnUpgradeCourier.disabled   = state.credibility < courierCost;

  if (state.procurementUnlocked) {
    ui.btnUpgradeProcurement.disabled   = true;
    ui.procurementStatusDisplay.innerText = 'Integrated';
  } else {
    ui.btnUpgradeProcurement.disabled   = state.credibility < PROCURE_FIXED_COST;
    ui.procurementStatusDisplay.innerText = 'Cost: 100 Creds';
  }
}

function renderGoals(): void {
  const jobDone = state.phase >= 2;
  ui.goalGetJob.classList.toggle('goal-done', jobDone);
  ui.goalCheckJob.innerText = jobDone ? '☑' : '☐';
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

  if (state.money <= 0.0) {
    ui.btnBeg.disabled = false;
  } else {
    ui.btnBeg.disabled = state.applications < 50;
  }

  renderGoals();
  if (state.phase === 1) renderPhase1();
  else if (state.phase === 2) renderPhase2();
}
