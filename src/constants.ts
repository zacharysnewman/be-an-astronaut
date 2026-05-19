export const SAVE_STORAGE_KEY = 'cubicle_chronicles_save_v11';
export const BASE_SUBMITTER_COST = 50;
export const BASE_TYPIST_COST    = 125;
export const BASE_COURIER_COST   = 150;
export const PROCURE_FIXED_COST  = 100;

export const EFFICIENCY_TIER_COSTS  = [500, 1000, 1500] as const;
export const JOB_SEARCH_TIER_COSTS  = [100, 1000, 10000] as const;
export const PRETTIFY_TIER_COSTS    = [75, 250, 800, 2500] as const;
export const PROCESSOR_COOLDOWN_S   = 2.0;
// At 100% findability, processes 2 apps/s. 1 keyword alone = 5% findability = 0.1 apps/s (1 per 10s).
export const SCREENING_RATE_BASE    = 2.0;
// Boost multipliers: tier 1 = +100% (2x), tier 2 = +150% (2.5x), tier 3 = +300% (4x)
export const EFFICIENCY_TIER_MULTS  = [1, 2, 2.5, 4] as const;

// Findability = keywords * KEYWORD_PENALTY + prettiness * PRETTINESS_BOOST (can exceed 100%)
// Desirability = clamp(1 - keywords * KEYWORD_PENALTY, 0, 1) (always 0-100%)
// Without prettiness they sum to exactly 100% — mutually exclusive.
export const KEYWORD_PENALTY   = 0.05;  // 20 keywords = 100% findability / 0% desirability
export const PRETTINESS_BOOST  = 0.1;   // each tier adds 10% findability
