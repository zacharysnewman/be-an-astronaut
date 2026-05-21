export const SAVE_STORAGE_KEY = 'cubicle_chronicles_save_v13';

export const MACROFIRM = 'Macrofirm';
export const INDEBT    = 'Indebt.com';
export const ZENMO     = 'Zenmo';
export const BASE_SUBMITTER_COST = 50;
export const BASE_TYPIST_COST    = 125;
export const BASE_COURIER_COST   = 150;
export const PROCURE_FIXED_COST  = 100;

export const EFFICIENCY_TIER_COSTS  = [500, 1000, 1500] as const;
export const JOB_SEARCH_TIER_COSTS  = [100, 1000, 10000] as const;
// Output multipliers per efficiency tier: 1x, 2x, 5x, 10x (additive tiers)
export const EFFICIENCY_TIER_MULTS  = [1, 2, 5, 10] as const;
