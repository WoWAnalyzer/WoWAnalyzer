import SPELLS from 'common/SPELLS';

// This is because since 7.1 Unstable Affliction recasts no longer refresh/increase the damage
// instead you can have up to 5 different UAs at the same time on the target and they have different spell IDs, hence this array
export const UNSTABLE_AFFLICTION_DEBUFFS = [
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5,
];
