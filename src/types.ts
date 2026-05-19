export type Phase        = 1 | 2;
export type Provider     = 'finite' | 'weeklink' | 'bliply';
export type ParentalTier = 1 | 2 | 3 | 4;
export type LogType      = 'bad' | 'good' | 'promo' | 'system' | '';

export interface GameState {
  phase:                Phase;
  money:                number;
  availableJobs:        number;
  applications:         number;
  maxAppsReached:       number;
  hasBegged:            boolean;
  hasUnlockedSubmission: boolean;
  hasFoundJob:          boolean;
  hasSubmittedApp:      boolean;
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
  currentPaperPrice:    number;
  lastComplimentTime:   number | null;
}
