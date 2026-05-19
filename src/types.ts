export type Phase        = 1 | 2;
export type Provider     = 'finite' | 'weeklink' | 'bliply';
export type ParentalTier = 1 | 2 | 3 | 4;
export type LogType      = 'bad' | 'good' | 'promo' | 'system' | '';

export interface GameState {
  phase:                Phase;
  money:                number;
  availableJobs:        number;
  applications:         number;  // Applications total (cumulative submitted count)
  unreadApplications:   number;  // ATS buffer: fills with submissions, drains to appsThruScreening
  appsThruScreening:    number;  // Screened apps — the spendable currency/score
  maxAppsReached:       number;  // Historical peak of appsThruScreening (for upgrade reveal)
  peakAppsSubmitted:    number;  // Historical peak of applications submitted (for finder/submitter reveal thresholds)
  keywords:             number;  // Player-controlled ATS keyword count
  prettinessLevel:      number;  // Upgrade modifier: adds to keywords for outflow calc only
  hasBegged:            boolean;
  hasUnlockedSubmission: boolean;
  hasFoundJob:          boolean;
  hasSubmittedApp:      boolean;
  hasScreenedApp:       boolean;
  openClawFinderLevel:  number;
  openClawSubmitLevel:  number;
  parentalTier:         ParentalTier;
  selectedProvider:     Provider;
  contractLocked:       boolean;
  providerTimer:        number;
  finiteMultiplier:     number;
  weeklinkMultiplier:   number;
  bliplyMultiplier:     number;
  providerPriceIndex:   number;
  level:                number;
  credibility:          number;
  approval:             number;
  reports:              number;
  paper:                number;
  typistLevel:          number;
  courierLevel:         number;
  procurementUnlocked:  boolean;
  efficiencyTier:       number;
  currentPaperPrice:    number;
  lastComplimentTime:   number | null;
}
