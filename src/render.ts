import { state, appsScreenedRate, appsRejectedRate, displayedMoney, totalAppsSubmitted } from './state';
import { ui } from './ui';
import { formatMoney, getGeometricCost } from './utils';
import {
  BASE_SUBMITTER_COST,
  BASE_TYPIST_COST,
  BASE_COURIER_COST,
  PROCURE_FIXED_COST,
  EFFICIENCY_TIER_COSTS,
  JOB_SEARCH_TIER_COSTS,
  PRETTIFY_TIER_COSTS,
  BASE_DESIRABILITY,
  PRETTINESS_BOOST,
  KEYWORD_PENALTY,
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
  const automationFlat = Math.floor(state.openClawSubmitLevel * 0.0025 * 100) / 100;
  const totalDrain = baseRate + automationFlat;
  ui.income.innerText = `${formatMoney(-totalDrain)}/s`;
  ui.income.classList.add('bad');
  ui.income.classList.remove('good');
  ui.headerFees.innerText = ui.income.innerText;
  ui.headerFees.className = 'bad';

  // Job Applications section — visible once the player owns at least one Auto-Submitter
  const showScreening = state.openClawSubmitLevel >= 1;

  ui.totalReadRow.classList.toggle('hidden', !showScreening);
  ui.totalReadDisplay.innerText = formatComma(totalAppsSubmitted);
  ui.availJobs.innerText = formatComma(state.availableJobs);
  ui.unreadAppsDisplay.innerText = formatComma(state.unreadApplications);
  ui.appsThruScreeningDisplay.innerText = formatComma(state.appsThruScreening);

  ui.keywordsSection.classList.toggle('hidden', !showScreening);

  ui.keywordsDisplay.innerText = String(state.keywords);
  ui.btnKeywordsDown.disabled = state.keywords <= 0;

  const desirability = Math.max(0, Math.min(1,
    BASE_DESIRABILITY + state.prettinessLevel * PRETTINESS_BOOST - state.keywords * KEYWORD_PENALTY
  ));
  ui.desirabilityDisplay.innerText = `${Math.round(desirability * 100)}%`;

  ui.rejectedAppsRow.classList.toggle('hidden', state.appsScreenedOut <= 0);
  ui.rejectedAppsDisplay.innerText = formatComma(state.appsScreenedOut);

  const showRate = state.hasScreenedApp || state.appsScreenedOut > 0;
  ui.screeningRateRow.classList.toggle('hidden', !showRate);
  ui.screeningRatePassDisplay.innerText = `+${appsScreenedRate.toFixed(1)}`;
  ui.screeningRateRejectDisplay.innerText = appsRejectedRate.toFixed(1);

  const [p1Cost, p2Cost, p3Cost, p4Cost] = PRETTIFY_TIER_COSTS;
  ui.upgradePrettifyT1Row.classList.toggle('hidden',
    !shouldShowUpgrade(state.maxAppsReached, p1Cost, state.prettinessLevel >= 1));
  ui.upgradePrettifyT2Row.classList.toggle('hidden',
    state.prettinessLevel < 1 || !shouldShowUpgrade(state.maxAppsReached, p2Cost, state.prettinessLevel >= 2));
  ui.upgradePrettifyT3Row.classList.toggle('hidden',
    state.prettinessLevel < 2 || !shouldShowUpgrade(state.maxAppsReached, p3Cost, state.prettinessLevel >= 3));
  ui.upgradePrettifyT4Row.classList.toggle('hidden',
    state.prettinessLevel < 3 || !shouldShowUpgrade(state.maxAppsReached, p4Cost, state.prettinessLevel >= 4));
  ui.btnUpgradePrettifyT1.disabled = state.appsThruScreening < p1Cost;
  ui.btnUpgradePrettifyT2.disabled = state.appsThruScreening < p2Cost;
  ui.btnUpgradePrettifyT3.disabled = state.appsThruScreening < p3Cost;
  ui.btnUpgradePrettifyT4.disabled = state.appsThruScreening < p4Cost;

  ui.btnFind.disabled = state.money < 1.00;
  ui.btnApply.disabled = state.money <= 0 || state.availableJobs < 1;

  ui.inlineAppRow.classList.toggle('hidden', !state.hasUnlockedSubmission);

  // Job Search tier upgrades
  const [js1Cost, js2Cost, js3Cost] = JOB_SEARCH_TIER_COSTS;
  ui.upgradeJobSearchT1Row.classList.toggle('hidden',
    !shouldShowUpgrade(state.maxAppsReached, js1Cost, state.jobSearchTier >= 1));
  ui.upgradeJobSearchT2Row.classList.toggle('hidden',
    state.jobSearchTier < 1 || !shouldShowUpgrade(state.maxAppsReached, js2Cost, state.jobSearchTier >= 2));
  ui.upgradeJobSearchT3Row.classList.toggle('hidden',
    state.jobSearchTier < 2 || !shouldShowUpgrade(state.maxAppsReached, js3Cost, state.jobSearchTier >= 3));
  ui.btnUpgradeJobSearchT1.disabled = state.appsThruScreening < js1Cost;
  ui.btnUpgradeJobSearchT2.disabled = state.appsThruScreening < js2Cost;
  ui.btnUpgradeJobSearchT3.disabled = state.appsThruScreening < js3Cost;

  ui.automationCardP1.classList.toggle('hidden', state.peakAppsSubmitted < 25);

  const submitterCost = BASE_SUBMITTER_COST * state.openClawSubmitLevel;
  ui.submitterBadge.innerText = String(state.openClawSubmitLevel);
  ui.submitterCostDisplay.innerText = formatComma(submitterCost);
  ui.btnUpgradeSubmitter.disabled = state.appsThruScreening < submitterCost;

  const [t1Cost, t2Cost, t3Cost] = EFFICIENCY_TIER_COSTS;
  ui.upgradeEfficiencyT1Row.classList.toggle('hidden',
    state.openClawSubmitLevel < 1 || !shouldShowUpgrade(state.maxAppsReached, t1Cost, state.efficiencyTier >= 1));
  ui.upgradeEfficiencyT2Row.classList.toggle('hidden',
    state.efficiencyTier < 1 || !shouldShowUpgrade(state.maxAppsReached, t2Cost, state.efficiencyTier >= 2));
  ui.upgradeEfficiencyT3Row.classList.toggle('hidden',
    state.efficiencyTier < 2 || !shouldShowUpgrade(state.maxAppsReached, t3Cost, state.efficiencyTier >= 3));

  ui.btnUpgradeEfficiencyT1.disabled = state.appsThruScreening < t1Cost;
  ui.btnUpgradeEfficiencyT2.disabled = state.appsThruScreening < t2Cost;
  ui.btnUpgradeEfficiencyT3.disabled = state.appsThruScreening < t3Cost;

  // Service provider section is disabled for now
  ui.providerContainer.classList.add('hidden');

  ui.parentalUpgradesContainer.classList.add('hidden');

  if (state.maxAppsReached >= 10000) {
    ui.jobCard.classList.remove('hidden');
    ui.btnInterview.disabled = state.appsThruScreening < 100000;
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
    ui.btnBeg.disabled = state.appsThruScreening < 50;
  }

  renderGoals();
  if (state.phase === 1) renderPhase1();
  else if (state.phase === 2) renderPhase2();
}
