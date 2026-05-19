function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export const ui = {
  p1Container: el('phase1-container'),
  p2Container: el('phase2-container'),
  goalsContainer: el('goals-container'),

  tabJobSearch: el<HTMLButtonElement>('tab-job-search'),
  tabGoals: el<HTMLButtonElement>('tab-goals'),
  tabMacrofirm: el<HTMLButtonElement>('tab-macrofirm'),

  goalGetJob: el('goal-get-job'),
  goalCheckJob: el('goal-check-job'),

  availJobs: el('avail-jobs-display'),
  apps: el('apps-display'),
  btnBeg: el<HTMLButtonElement>('btn-beg'),
  begCostLabel: el('beg-cost-label'),
  btnFind: el<HTMLButtonElement>('btn-find'),
  btnApply: el<HTMLButtonElement>('btn-apply'),
  btnInterview: el<HTMLButtonElement>('btn-interview'),
  jobCard: el('job-card'),

  inlineAppRow: el('inline-app-row'),
  finderRateRow: el('finder-rate-row'),
  finderRateDisplay: el('finder-rate-display'),
  submitterRateRow: el('submitter-rate-row'),
  submitterRateDisplay: el('submitter-rate-display'),

  automationCardP1: el('automation-p1-card'),
  finderBadge: el('finder-level-badge'),
  btnUpgradeFinder: el<HTMLButtonElement>('btn-upgrade-finder'),
  finderCostDisplay: el('finder-cost-display'),
  submitterBadge: el('submitter-level-badge'),
  btnUpgradeSubmitter: el<HTMLButtonElement>('btn-upgrade-submitter'),
  submitterCostDisplay: el('submitter-cost-display'),
  upgradeSubmitterRow: el('upgrade-submitter-row'),

  providerContainer: el('provider-container'),
  btnFinite: el<HTMLButtonElement>('provider-finite'),
  btnWeeklink: el<HTMLButtonElement>('provider-weeklink'),
  btnBliply: el<HTMLButtonElement>('provider-bliply'),
  rateFinite: el('rate-finite'),
  rateWeeklink: el('rate-weeklink'),
  rateBliply: el('rate-bliply'),

  parentalUpgradesContainer: el('parental-upgrades-container'),
  upgradeParentT2: el('upgrade-parental-t2'),
  upgradeParentT3: el('upgrade-parental-t3'),
  upgradeParentT4: el('upgrade-parental-t4'),
  btnUpgradeParentT2: el<HTMLButtonElement>('btn-upgrade-parent-t2'),
  btnUpgradeParentT3: el<HTMLButtonElement>('btn-upgrade-parent-t3'),
  btnUpgradeParentT4: el<HTMLButtonElement>('btn-upgrade-parent-t4'),

  level: el('level-display'),
  perf: el('perf-display'),
  appr: el('appr-display'),
  paper: el('paper-display'),
  paperCostDisplay: el('paper-cost-display'),
  reports: el('reports-display'),
  reportRate: el('report-rate-display'),
  timer: el('timer-display'),
  btnPaper: el<HTMLButtonElement>('btn-paper'),
  btnWrite: el<HTMLButtonElement>('btn-write'),
  btnSubmit: el<HTMLButtonElement>('btn-submit'),
  btnCompliment: el<HTMLButtonElement>('btn-compliment'),
  btnLunch: el<HTMLButtonElement>('btn-lunch'),

  typistBadge: el('typist-level-badge'),
  typistCostDisplay: el('typist-cost-display'),
  btnUpgradeTypist: el<HTMLButtonElement>('btn-upgrade-typist'),
  courierBadge: el('courier-level-badge'),
  courierCostDisplay: el('courier-cost-display'),
  btnUpgradeCourier: el<HTMLButtonElement>('btn-upgrade-courier'),
  btnUpgradeProcurement: el<HTMLButtonElement>('btn-upgrade-procurement'),
  procurementStatusDisplay: el('procurement-status-display'),

  money: el('money-display'),
  income: el('income-display'),
  log: el('log'),
  debugPanel: el('debug-panel'),
  bankruptcyOverlay: el('bankruptcy-overlay'),

  dbFiniteMult: el('db-finite-mult'),
  dbWeeklinkMult: el('db-weeklink-mult'),
  dbBliplyMult: el('db-bliply-mult'),
};
