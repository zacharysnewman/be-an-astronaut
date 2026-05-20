export type Phase    = 1 | 2;
export type Provider = 'finite' | 'weeklink' | 'bliply';
export type LogType  = 'bad' | 'good' | 'promo' | 'system' | '';

export interface GameState {
  phase:                Phase;
  money:                number;
  availableJobs:        number;
  applications:         number;   // Cumulative total apps submitted (never decreases)
  applyCredits:         number;   // Apply Credits (AC) — spendable currency earned 1:1 per submission
  maxACReached:         number;   // Historical peak of applyCredits (for upgrade reveal)
  hasUnlockedSubmission: boolean;
  hasSubmittedApp:      boolean;
  jobSearchTier:        number;   // 0-3: multiplies Find Jobs result by 10^tier
  openClawSubmitLevel:  number;
  efficiencyTier:       number;
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
  currentPaperPrice:    number;
  lastComplimentTime:   number | null;
}
