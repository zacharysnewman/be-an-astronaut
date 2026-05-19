export const SAVE_STORAGE_KEY = 'cubicle_chronicles_save_v11';
export const BASE_SUBMITTER_COST = 50;
export const BASE_TYPIST_COST    = 125;
export const BASE_COURIER_COST   = 150;
export const PROCURE_FIXED_COST  = 100;

export const EFFICIENCY_TIER_COSTS  = [500, 1000, 1500] as const;
export const JOB_SEARCH_TIER_COSTS  = [100, 1000, 10000] as const;
export const PRETTIFY_TIER_COSTS    = [75, 250, 800, 2500] as const;
export const PROCESSOR_COOLDOWN_S   = 2.0;
// Boost multipliers: tier 1 = +100% (2x), tier 2 = +150% (2.5x), tier 3 = +300% (4x)
export const EFFICIENCY_TIER_MULTS  = [1, 2, 2.5, 4] as const;

// Resume desirability: base + prettiness bonus - keyword penalty
// At 0 keywords, 0 prettiness: 100% pass-through
// At 20 keywords, 0 prettiness: 1.0 - 20*0.05 = 0% pass-through
// Prettiness can push desirability above 100% (displayed raw, clamped to 100% for math)
export const BASE_DESIRABILITY  = 1.0;
export const PRETTINESS_BOOST   = 0.1;
export const KEYWORD_PENALTY    = 0.05;
