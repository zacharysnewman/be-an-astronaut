// --- MOBILE GESTURE PREVENTION ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) event.preventDefault();
}, { passive: false });

// --- LOCAL STORAGE KEY ---
const SAVE_STORAGE_KEY = 'cubicle_chronicles_save_v3';

// --- CORE GAME STATE ---
let state = {
    phase: 1,
    money: 1.00,

    // Phase 1 Mechanics
    availableJobs: 0.0,
    applications: 0.0,
    maxAppsReached: 0.0,
    hasBegged: false,
    hasUnlockedSubmission: false,

    // Phase 1 Automations
    openClawFinderLevel: 0,
    openClawSubmitLevel: 0,
    parentalTier: 1, // Tier 1: $3, Tier 2: $6, Tier 3: $9, Tier 4: $9 Auto

    // Internet Provider selection metrics
    selectedProvider: 'finite',
    contractLocked: false,
    providerTimer: 20.0,
    finiteMultiplier: 1.0,
    weeklinkMultiplier: 1.5,
    bliplyMultiplier: 2.2,

    // Phase 2 Mechanics
    level: 1,
    credibility: 0.0,
    approval: 50.0,
    reports: 0.0,
    paper: 10.0,

    // Phase 2 Automations
    typistLevel: 0,
    courierLevel: 0,
    procurementUnlocked: false,

    // Global Metrics
    currentPaperPrice: 0.30,
    lastComplimentTime: null
};

// --- PROGRESSION CONSTANTS ---
const BASE_FINDER_COST = 50;
const BASE_SUBMITTER_COST = 50;

const BASE_TYPIST_COST = 125;
const BASE_COURIER_COST = 150;
const PROCURE_FIXED_COST = 100;

// Sub-second loop timer variables
let lastTimestamp = performance.now();
let paperPriceTimer = 0.0;
let cloudSaveTimer = 0.0;
let warningThrottleTimer = 0.0;

// --- DOM REFERENCE UTILITIES ---
const ui = {
    p1Container: document.getElementById('phase1-container'),
    p2Container: document.getElementById('phase2-container'),

    availJobs: document.getElementById('avail-jobs-display'),
    apps: document.getElementById('apps-display'),
    btnBeg: document.getElementById('btn-beg'),
    begCostLabel: document.getElementById('beg-cost-label'),
    btnFind: document.getElementById('btn-find'),
    btnApply: document.getElementById('btn-apply'),
    btnInterview: document.getElementById('btn-interview'),
    jobCard: document.getElementById('job-card'),

    inlineAppRow: document.getElementById('inline-app-row'),
    finderRateInd: document.getElementById('finder-rate-indicator'),
    submitterRateInd: document.getElementById('submitter-rate-indicator'),

    // Phase 1 Automations Group
    automationCardP1: document.getElementById('automation-p1-card'),
    finderBadge: document.getElementById('finder-level-badge'),
    btnUpgradeFinder: document.getElementById('btn-upgrade-finder'),
    finderCostDisplay: document.getElementById('finder-cost-display'),
    submitterBadge: document.getElementById('submitter-level-badge'),
    btnUpgradeSubmitter: document.getElementById('btn-upgrade-submitter'),
    submitterCostDisplay: document.getElementById('submitter-cost-display'),
    upgradeSubmitterRow: document.getElementById('upgrade-submitter-row'),

    // Internet Providers Selector Group
    providerContainer: document.getElementById('provider-container'),
    contractTimer: document.getElementById('contract-timer-display'),
    btnFinite: document.getElementById('provider-finite'),
    btnWeeklink: document.getElementById('provider-weeklink'),
    btnBliply: document.getElementById('provider-bliply'),
    rateFinite: document.getElementById('rate-finite'),
    rateWeeklink: document.getElementById('rate-weeklink'),
    rateBliply: document.getElementById('rate-bliply'),

    // Parental Upgrades
    parentalUpgradesContainer: document.getElementById('parental-upgrades-container'),
    upgradeParentT2: document.getElementById('upgrade-parental-t2'),
    upgradeParentT3: document.getElementById('upgrade-parental-t3'),
    upgradeParentT4: document.getElementById('upgrade-parental-t4'),
    btnUpgradeParentT2: document.getElementById('btn-upgrade-parent-t2'),
    btnUpgradeParentT3: document.getElementById('btn-upgrade-parent-t3'),
    btnUpgradeParentT4: document.getElementById('btn-upgrade-parent-t4'),

    // Phase 2 Group
    level: document.getElementById('level-display'),
    perf: document.getElementById('perf-display'),
    appr: document.getElementById('appr-display'),
    paper: document.getElementById('paper-display'),
    paperCostDisplay: document.getElementById('paper-cost-display'),
    reports: document.getElementById('reports-display'),
    reportRate: document.getElementById('report-rate-display'),
    timer: document.getElementById('timer-display'),
    btnPaper: document.getElementById('btn-paper'),
    btnWrite: document.getElementById('btn-write'),
    btnSubmit: document.getElementById('btn-submit'),
    btnCompliment: document.getElementById('btn-compliment'),
    btnLunch: document.getElementById('btn-lunch'),

    // Phase 2 Automations Group
    typistBadge: document.getElementById('typist-level-badge'),
    typistCostDisplay: document.getElementById('typist-cost-display'),
    btnUpgradeTypist: document.getElementById('btn-upgrade-typist'),
    courierBadge: document.getElementById('courier-level-badge'),
    courierCostDisplay: document.getElementById('courier-cost-display'),
    btnUpgradeCourier: document.getElementById('btn-upgrade-courier'),
    btnUpgradeProcurement: document.getElementById('btn-upgrade-procurement'),
    procurementStatusDisplay: document.getElementById('procurement-status-display'),

    money: document.getElementById('money-display'),
    income: document.getElementById('income-display'),
    log: document.getElementById('log'),
    debugPanel: document.getElementById('debug-panel'),
    bankruptcyOverlay: document.getElementById('bankruptcy-overlay'),

    dbFiniteMult: document.getElementById('db-finite-mult'),
    dbWeeklinkMult: document.getElementById('db-weeklink-mult'),
    dbBliplyMult: document.getElementById('db-bliply-mult')
};

// --- CORE HELPER FUNCTIONS ---
function logMessage(msg, type = "") {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let colorStyle = "";
    if (type === "bad") colorStyle = "color: #ff5555; font-weight: bold;";
    if (type === "good") colorStyle = "color: #55ff55; font-weight: bold;";
    if (type === "promo") colorStyle = "color: #55aaff; font-weight: bold;";
    if (type === "system") colorStyle = "color: #d284fc;";

    ui.log.innerHTML = `<span style="${colorStyle}">[${time}] ${msg}</span><br>` + ui.log.innerHTML;
}

function formatMoney(amount) {
    const absAmount = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
}

function getGeometricCost(base, rate, level) {
    return Math.floor(base * Math.pow(rate, level));
}

function getExponentialCost(base, multiplier, level) {
    return Math.floor(base * Math.pow(multiplier, level));
}

function triggerCloudSave(manual = false) {
    try {
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
        if (manual) {
            logMessage("Cloud Database Save forced manually. Current layout written.", "system");
        }
    } catch (err) {
        console.error("Local storage error: ", err);
    }
}

function loadCloudState() {
    try {
        const raw = localStorage.getItem(SAVE_STORAGE_KEY);
        if (raw) {
            const loaded = JSON.parse(raw);
            if (typeof loaded === "object" && loaded !== null) {
                state = { ...state, ...loaded };
                logMessage("Cloud save document found! Synced previous session telemetry.", "good");
                return;
            }
        }
        logMessage("No existing cloud profile detected. Welcoming new applicant.", "system");
    } catch (e) {
        logMessage("Local sandbox restricted saving. Session will reset on reload.", "bad");
    }
}

function transitionToPhase(targetPhase) {
    if (targetPhase === 2) {
        state.phase = 2;
        state.approval = 50.0;
        ui.p1Container.classList.add('hidden');
        ui.p2Container.classList.remove('hidden');
        ui.bankruptcyOverlay.classList.add('hidden');
        logMessage("Macrofirm Interview successfully completed. Assigned Desk 4B. Get to work.", "promo");
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } else {
        state.phase = 1;
        ui.p2Container.classList.add('hidden');
        ui.p1Container.classList.remove('hidden');
        logMessage("Corporate connection severed. Returned to Indebt Jobseeker directory.", "system");
    }
    updateUI();
}

function updateUI() {
    const formatComma = (val) => Math.floor(val).toLocaleString('en-US');

    ui.money.innerText = formatMoney(state.money);

    // Bankruptcy Shroud Visual Trigger
    const isBankrupt = (state.phase === 1 && state.money <= 0.0);
    if (isBankrupt) {
        ui.money.classList.add('flashing-bankrupt');
        ui.bankruptcyOverlay.classList.remove('hidden');
        window.scrollTo(0, 0); // Programmatically force focus up to parent beg button
    } else {
        ui.money.classList.remove('flashing-bankrupt');
        ui.bankruptcyOverlay.classList.add('hidden');
    }

    // Parental Bailout Button Status
    let manualPayoutAmt = 3.00;
    if (state.parentalTier === 2) manualPayoutAmt = 6.00;
    if (state.parentalTier >= 3) manualPayoutAmt = 9.00;
    ui.begCostLabel.innerText = `+$${manualPayoutAmt.toFixed(2)}`;

    if (state.money <= 0.0) {
        ui.btnBeg.disabled = false;
    } else {
        ui.btnBeg.disabled = state.applications < 50;
    }

    if (state.phase === 1) {
        // --- PHASE 1 RENDER ---
        let providerRate = 0.0;
        let activeFeePenalty = Math.max(0.01, (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02));

        if (state.openClawSubmitLevel >= 1) {
            if (state.selectedProvider === 'finite') providerRate = activeFeePenalty * state.finiteMultiplier;
            else if (state.selectedProvider === 'weeklink') providerRate = activeFeePenalty * state.weeklinkMultiplier;
            else if (state.selectedProvider === 'bliply') providerRate = activeFeePenalty * state.bliplyMultiplier;
        } else {
            providerRate = (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02);
        }

        let totalDrain = 0.01 + providerRate;
        ui.income.innerText = `(${formatMoney(-totalDrain)} / sec)`;
        ui.income.classList.add('bad');
        ui.income.classList.remove('good');

        ui.availJobs.innerText = formatComma(state.availableJobs);
        ui.apps.innerText = formatComma(state.applications);

        let finderOut = state.openClawFinderLevel > 0 ? Math.pow(3, state.openClawFinderLevel - 1) : 0;
        ui.finderRateInd.innerText = finderOut > 0 ? `(+${finderOut}/s)` : '';

        let submitterOut = state.openClawSubmitLevel > 0 ? Math.pow(2, state.openClawSubmitLevel - 1) : 0;
        ui.submitterRateInd.innerText = submitterOut > 0 ? `(+${submitterOut}/s)` : '';

        ui.btnFind.disabled = state.money <= 0;
        ui.btnApply.disabled = state.money <= 0 || state.availableJobs < 1;

        ui.inlineAppRow.classList.toggle('hidden', !state.hasUnlockedSubmission);

        // 10% Protocol: Finder reveals at 5 cumulative apps (cost: 50)
        ui.automationCardP1.classList.toggle('hidden', state.maxAppsReached < (0.10 * BASE_FINDER_COST));

        const finderCost = getExponentialCost(BASE_FINDER_COST, 3, state.openClawFinderLevel);
        ui.finderBadge.innerText = state.openClawFinderLevel;
        ui.finderCostDisplay.innerText = formatComma(finderCost);
        ui.btnUpgradeFinder.disabled = state.applications < finderCost;

        // Submitter reveals at Finder Level 2
        if (state.openClawFinderLevel >= 2) {
            ui.upgradeSubmitterRow.classList.remove('hidden');
            const submitterCost = getExponentialCost(BASE_SUBMITTER_COST, 2, state.openClawSubmitLevel);
            ui.submitterBadge.innerText = state.openClawSubmitLevel;
            ui.submitterCostDisplay.innerText = formatComma(submitterCost);
            ui.btnUpgradeSubmitter.disabled = state.applications < submitterCost;
        } else {
            ui.upgradeSubmitterRow.classList.add('hidden');
        }

        // Provider selection unlocked at Submitter level 1
        const isSubmitUnlocked = (state.openClawSubmitLevel >= 1);
        if (isSubmitUnlocked) {
            ui.providerContainer.classList.remove('hidden');

            let baseVal = Math.max(0.01, (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02));
            ui.rateFinite.innerText = `($${(baseVal * state.finiteMultiplier).toFixed(4)}/s)`;
            ui.rateWeeklink.innerText = `($${(baseVal * state.weeklinkMultiplier).toFixed(4)}/s)`;
            ui.rateBliply.innerText = `($${(baseVal * state.bliplyMultiplier).toFixed(4)}/s)`;

            ui.btnFinite.disabled = state.contractLocked;
            ui.btnWeeklink.disabled = state.contractLocked;
            ui.btnBliply.disabled = state.contractLocked;

            ui.btnFinite.style.backgroundColor = (state.selectedProvider === 'finite') ? '#bbb' : '#efefef';
            ui.btnWeeklink.style.backgroundColor = (state.selectedProvider === 'weeklink') ? '#bbb' : '#efefef';
            ui.btnBliply.style.backgroundColor = (state.selectedProvider === 'bliply') ? '#bbb' : '#efefef';
        } else {
            ui.providerContainer.classList.add('hidden');
        }

        // Parental support curve gating (Tiered progression)
        let showParentBox = false;

        // Tier 2 reveals at 200 cumulative apps once manual beg happened
        if (state.maxAppsReached >= 200 && state.hasBegged && state.parentalTier === 1) {
            ui.upgradeParentT2.classList.remove('hidden');
            ui.btnUpgradeParentT2.disabled = state.applications < 2000;
            showParentBox = true;
        } else {
            ui.upgradeParentT2.classList.add('hidden');
        }

        // Tier 3 reveals after Tier 2 bought
        if (state.parentalTier === 2) {
            ui.upgradeParentT3.classList.remove('hidden');
            ui.btnUpgradeParentT3.disabled = state.applications < 4000;
            showParentBox = true;
        } else {
            ui.upgradeParentT3.classList.add('hidden');
        }

        // Tier 4 reveals after Tier 3 bought, gated by 10% protocol: 5,000 maxAppsReached
        if (state.parentalTier === 3 && state.maxAppsReached >= 5000) {
            ui.upgradeParentT4.classList.remove('hidden');
            ui.btnUpgradeParentT4.disabled = state.applications < 50000;
            showParentBox = true;
        } else {
            ui.upgradeParentT4.classList.add('hidden');
        }

        ui.parentalUpgradesContainer.classList.toggle('hidden', !showParentBox);

        // Macrofirm Interview triggers via a custom retro job card
        if (state.maxAppsReached >= 10000) {
            ui.jobCard.classList.remove('hidden');
            ui.btnInterview.disabled = state.applications < 100000;
        } else {
            ui.jobCard.classList.add('hidden');
        }

        ui.dbFiniteMult.innerText = state.finiteMultiplier.toFixed(2);
        ui.dbWeeklinkMult.innerText = state.weeklinkMultiplier.toFixed(2);
        ui.dbBliplyMult.innerText = state.bliplyMultiplier.toFixed(2);

    } else if (state.phase === 2) {
        // --- PHASE 2 RENDER ---
        const hourlySalary = state.level * 0.01;
        ui.income.innerText = `(+${formatMoney(hourlySalary)} / sec)`;
        ui.income.classList.remove('bad');
        ui.income.classList.add('good');

        ui.level.innerText = state.level;
        ui.appr.innerText = state.approval.toFixed(0);
        ui.paper.innerText = state.paper.toFixed(1);
        ui.reports.innerText = Math.floor(state.reports);
        ui.perf.innerText = state.credibility.toFixed(0);

        ui.paperCostDisplay.innerText = formatMoney(state.currentPaperPrice);
        ui.btnPaper.disabled = state.money < state.currentPaperPrice;
        ui.btnWrite.disabled = state.paper < 1;
        ui.btnSubmit.disabled = state.reports < 1;

        ui.btnLunch.classList.toggle('hidden', state.approval < 80);

        if (state.typistLevel > 0 || state.courierLevel > 0) {
            ui.reportRate.innerText = `(+${state.typistLevel * 2}/s | -${state.courierLevel * 2}/s)`;
        } else {
            ui.reportRate.innerText = "";
        }

        if (state.lastComplimentTime) {
            let passed = ((Date.now() - state.lastComplimentTime) / 1000).toFixed(1);
            ui.timer.innerText = `Manager Status: Wait ${passed}s`;
            ui.timer.classList.toggle('bad', passed < 5.0);
        } else {
            ui.timer.innerText = "Manager Status: Stable";
        }

        const typistCost = getGeometricCost(BASE_TYPIST_COST, 1.5, state.typistLevel);
        ui.typistBadge.innerText = state.typistLevel;
        ui.typistCostDisplay.innerText = formatComma(typistCost);
        ui.btnUpgradeTypist.disabled = state.credibility < typistCost;

        const courierCost = getGeometricCost(BASE_COURIER_COST, 1.5, state.courierLevel);
        ui.courierBadge.innerText = state.courierLevel;
        ui.courierCostDisplay.innerText = formatComma(courierCost);
        ui.btnUpgradeCourier.disabled = state.credibility < courierCost;

        if (state.procurementUnlocked) {
            ui.btnUpgradeProcurement.disabled = true;
            ui.procurementStatusDisplay.innerText = "Integrated";
        } else {
            ui.btnUpgradeProcurement.disabled = state.credibility < PROCURE_FIXED_COST;
            ui.procurementStatusDisplay.innerText = "Cost: 100 Creds";
        }
    }
}

// --- GAMEPLAY EVENT LISTENERS ---
ui.btnBeg.addEventListener('click', () => {
    let pAmount = 3.00;
    if (state.parentalTier === 2) pAmount = 6.00;
    if (state.parentalTier >= 3) pAmount = 9.00;

    if (state.money <= 0.0) {
        state.money += pAmount;
        state.hasBegged = true;
        logMessage(`Wired parental bailout capital. Bank balance credited with +$${pAmount.toFixed(2)}.`, "system");
    } else {
        if (state.applications >= 50) {
            state.applications -= 50;
            state.money += pAmount;
            state.hasBegged = true;
            logMessage(`Exchanged submitted pipelines to secure parent wire transfer of +$${pAmount.toFixed(2)}.`, "system");
        }
    }
    updateUI();
});

ui.btnFind.addEventListener('click', () => {
    if (state.money > 0) {
        state.availableJobs += 1.0;
        if (state.availableJobs >= 25 && !state.hasUnlockedSubmission) {
            state.hasUnlockedSubmission = true;
            logMessage("Application pipelines activated! Submit engine unlocked.", "good");
        }
    }
    updateUI();
});

ui.btnApply.addEventListener('click', () => {
    if (state.money > 0 && state.availableJobs >= 1) {
        state.availableJobs -= 1.0;
        state.applications += 1.0;
        state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
    }
    updateUI();
});

ui.btnUpgradeFinder.addEventListener('click', () => {
    const cost = getExponentialCost(BASE_FINDER_COST, 3, state.openClawFinderLevel);
    if (state.applications >= cost) {
        state.applications -= cost;
        state.openClawFinderLevel += 1;
        logMessage(`OpenClaw Auto-Finder upgraded to Level ${state.openClawFinderLevel}. Processing capacity tripled.`, "good");
    }
    updateUI();
});

ui.btnUpgradeSubmitter.addEventListener('click', () => {
    const cost = getExponentialCost(BASE_SUBMITTER_COST, 2, state.openClawSubmitLevel);
    if (state.applications >= cost) {
        state.applications -= cost;
        state.openClawSubmitLevel += 1;
        logMessage(`OpenClaw Auto-Submitter upgraded to Level ${state.openClawSubmitLevel}. Submission pipeline doubled.`, "good");
    }
    updateUI();
});

// Provider click handlers (Contracts Lock-in mechanics)
const registerProviderTab = (id, keyName) => {
    document.getElementById(id).addEventListener('click', () => {
        if (!state.contractLocked) {
            state.selectedProvider = keyName;
            state.contractLocked = true;

            let baseVal = Math.max(0.01, (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02));
            let mult = 1.0;
            if (keyName === 'finite') mult = state.finiteMultiplier;
            else if (keyName === 'weeklink') mult = state.weeklinkMultiplier;
            else if (keyName === 'bliply') mult = state.bliplyMultiplier;

            logMessage(`Signed legally-binding 20s contract with ${keyName.toUpperCase()} at $${(baseVal * mult).toFixed(4)}/s.`, "system");
            updateUI();
        }
    });
};
registerProviderTab('provider-finite', 'finite');
registerProviderTab('provider-weeklink', 'weeklink');
registerProviderTab('provider-bliply', 'bliply');

ui.btnUpgradeParentT2.addEventListener('click', () => {
    if (state.applications >= 2000 && state.parentalTier === 1) {
        state.applications -= 2000;
        state.parentalTier = 2;
        logMessage("Parental Trust optimized to Tier 2. Emergency wire allowance increased to $6.00.", "good");
    }
    updateUI();
});

ui.btnUpgradeParentT3.addEventListener('click', () => {
    if (state.applications >= 4000 && state.parentalTier === 2) {
        state.applications -= 4000;
        state.parentalTier = 3;
        logMessage("Parental Trust optimized to Tier 3. Elite family trust wires $9.00.", "good");
    }
    updateUI();
});

ui.btnUpgradeParentT4.addEventListener('click', () => {
    if (state.applications >= 50000 && state.parentalTier === 3) {
        state.applications -= 50000;
        state.parentalTier = 4;
        logMessage("Automatic background banking loops initialized. Family allowance automated.", "good");
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
        logMessage(`Acquired printing ream sheets at market rate of ${formatMoney(state.currentPaperPrice)}.`, "good");
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
        logMessage("Administrative logs handed off. Supervisor credibility upgraded.");
    }
    updateUI();
});

ui.btnCompliment.addEventListener('click', () => {
    const now = Date.now();
    if (!state.lastComplimentTime) {
        state.approval += 10.0;
        logMessage("Lauded supervisor's coordinate tie palette.", "good");
    } else {
        let diff = (now - state.lastComplimentTime) / 1000;
        if (diff < 5.0) {
            state.approval -= 5.0;
            logMessage("You're lingering around the supervisor's desk too aggressively.", "bad");
        } else {
            state.approval += 10.0;
            logMessage("Expressed elegant technical alignment with supervisor's draft.", "good");
        }
    }
    state.lastComplimentTime = now;
    updateUI();
});

ui.btnLunch.addEventListener('click', () => {
    if (state.approval >= 80.0) {
        state.level += 1;
        state.approval = 30.0;
        logMessage(`Attended office banquet. Promoted to Grade Level ${state.level}. Salary rate buffed.`, "promo");
    }
    updateUI();
});

ui.btnUpgradeTypist.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_TYPIST_COST, 1.5, state.typistLevel);
    if (state.credibility >= cost) {
        state.credibility -= cost;
        state.typistLevel += 1;
        logMessage(`Enlisted Subcontracted Typist (Level ${state.typistLevel}) to handle documentation drafting.`, "good");
    }
    updateUI();
});

ui.btnUpgradeCourier.addEventListener('click', () => {
    const cost = getGeometricCost(BASE_COURIER_COST, 1.5, state.courierLevel);
    if (state.credibility >= cost) {
        state.credibility -= cost;
        state.courierLevel += 1;
        logMessage(`Deployed HR Courier Line (Level ${state.courierLevel}) for automated submissions.`, "good");
    }
    updateUI();
});

ui.btnUpgradeProcurement.addEventListener('click', () => {
    if (state.credibility >= PROCURE_FIXED_COST && !state.procurementUnlocked) {
        state.credibility -= PROCURE_FIXED_COST;
        state.procurementUnlocked = true;
        logMessage("Background procurement script online. Automated printing ream restocking functional.", "good");
    }
    updateUI();
});

// --- DEBUG PANEL EVENT LISTENERS ---
document.getElementById('debug-toggle').addEventListener('click', () => {
    ui.debugPanel.classList.toggle('hidden');
});

document.getElementById('btn-debug-save').addEventListener('click', () => {
    triggerCloudSave(true);
});

document.getElementById('btn-debug-reset').addEventListener('click', () => {
    if (confirm("Execute master database wipe? All progress will revert to zero.")) {
        localStorage.removeItem(SAVE_STORAGE_KEY);
        location.reload();
    }
});

document.getElementById('btn-debug-toggle-phase').addEventListener('click', () => {
    if (state.phase === 1) transitionToPhase(2);
    else transitionToPhase(1);
});

document.getElementById('btn-debug-zero-money').addEventListener('click', () => {
    state.money = 0.00;
    logMessage("[DEBUG] Account wiped. Hard set to $0.00.", "bad");
    updateUI();
});

document.getElementById('btn-debug-inject-money').addEventListener('click', () => {
    state.money += 1000;
    logMessage("[DEBUG] Injected resources +1000 to system.", "system");
    updateUI();
});

document.getElementById('btn-debug-inject-apps').addEventListener('click', () => {
    state.applications += 1000;
    state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
    logMessage("[DEBUG] Injected resources +1000 to system.", "system");
    updateUI();
});

document.getElementById('btn-debug-inject-creds').addEventListener('click', () => {
    state.credibility += 500;
    logMessage("[DEBUG] Injected resources +500 to system.", "system");
    updateUI();
});

document.getElementById('btn-debug-inject-paper').addEventListener('click', () => {
    state.paper += 100;
    logMessage("[DEBUG] Injected resources +100 to system.", "system");
    updateUI();
});

// --- CORE TICK PHYSICS LOOP ---
function mainLoop(currentTimestamp) {
    let dt = (currentTimestamp - lastTimestamp) / 1000;
    if (dt < 0.0) dt = 0.0;
    if (dt > 1.0) dt = 1.0;
    lastTimestamp = currentTimestamp;

    if (state.phase === 1) {
        let providerRate = 0.0;
        let activeFeePenalty = Math.max(0.01, (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02));

        if (state.openClawSubmitLevel >= 1) {
            if (state.selectedProvider === 'finite') providerRate = activeFeePenalty * state.finiteMultiplier;
            else if (state.selectedProvider === 'weeklink') providerRate = activeFeePenalty * state.weeklinkMultiplier;
            else if (state.selectedProvider === 'bliply') providerRate = activeFeePenalty * state.bliplyMultiplier;
        } else {
            providerRate = (state.openClawFinderLevel * 0.03) + (state.openClawSubmitLevel * 0.02);
        }

        let totalDrain = 0.01 + providerRate;
        state.money -= totalDrain * dt;

        if (state.money <= 0.0) {
            state.money = 0.0;
            if (state.parentalTier === 4) {
                state.money += 9.00;
                state.hasBegged = true;
                logMessage("Automated Script: Direct trust wire injection completed. Directing +$9.00.", "system");
            }
        }

        // Auto-Finder outputs triple: +1, +3, +9, +27...
        let finderVolume = state.openClawFinderLevel > 0 ? Math.pow(3, state.openClawFinderLevel - 1) : 0;
        state.availableJobs += finderVolume * dt;

        if (state.availableJobs >= 25 && !state.hasUnlockedSubmission) {
            state.hasUnlockedSubmission = true;
            logMessage("Application pipelines activated! Submit engine unlocked.", "good");
        }

        // Auto-Submitter outputs double: +1, +2, +4, +8...
        let submitterVolume = state.openClawSubmitLevel > 0 ? Math.pow(2, state.openClawSubmitLevel - 1) : 0;
        let actualSubmissions = Math.min(submitterVolume * dt, state.availableJobs);
        if (actualSubmissions > 0) {
            state.availableJobs -= actualSubmissions;
            state.applications += actualSubmissions;
            state.maxAppsReached = Math.max(state.maxAppsReached, state.applications);
        }

        // 20-Second Locked Contract selection tick
        if (state.openClawSubmitLevel >= 1) {
            state.providerTimer -= dt;
            if (state.providerTimer <= 0.0) {
                state.providerTimer = 20.0;
                state.contractLocked = false; // Briefly lift the lock mechanism

                // Randomize multipliers within range [0.5x, 3.5x] representing 300% variance scale
                state.finiteMultiplier = 0.5 + Math.random() * 3.0;
                state.weeklinkMultiplier = 0.5 + Math.random() * 3.0;
                state.bliplyMultiplier = 0.5 + Math.random() * 3.0;

                logMessage("Billing contract window reset. Provider tariffs adjusted.", "system");
            }
            ui.contractTimer.innerText = state.providerTimer.toFixed(1) + "s";
        }

    } else if (state.phase === 2) {
        state.money += (state.level * 0.01) * dt;

        let typistDraftRate = state.typistLevel * 2.0;
        let possibleDrafts = Math.min(typistDraftRate * dt, state.paper);
        if (possibleDrafts > 0) {
            state.paper -= possibleDrafts;
            state.reports += possibleDrafts;
        } else if (state.paper <= 0 && state.typistLevel > 0) {
            if (warningThrottleTimer <= 0) {
                logMessage("Operations Alert: Out of printing paper! Subcontracted typists idling.", "bad");
                warningThrottleTimer = 4.0;
            }
        }

        let courierSubRate = state.courierLevel * 2.0;
        let possibleSubmissions = Math.min(courierSubRate * dt, state.reports);
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

    // Commodity market dynamic fluctuation
    paperPriceTimer += dt;
    if (paperPriceTimer >= 1.0) {
        paperPriceTimer -= 1.0;
        let rollState = Math.floor(Math.random() * 3);
        let priceVariation = 0.01 + (Math.random() * 0.03);
        if (rollState === 0) state.currentPaperPrice = Math.min(0.50, state.currentPaperPrice + priceVariation);
        else if (rollState === 1) state.currentPaperPrice = Math.max(0.10, state.currentPaperPrice - priceVariation);
    }

    // Auto-save every 15s
    cloudSaveTimer += dt;
    if (cloudSaveTimer >= 15.0) {
        cloudSaveTimer -= 15.0;
        triggerCloudSave();
    }

    if (warningThrottleTimer > 0) warningThrottleTimer -= dt;

    updateUI();
    requestAnimationFrame(mainLoop);
}

// --- INIT ---
window.onload = function () {
    loadCloudState();
    if (state.phase === 2) transitionToPhase(2);
    else transitionToPhase(1);
    requestAnimationFrame(mainLoop);
};
