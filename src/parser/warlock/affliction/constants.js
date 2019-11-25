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

export const getDotDurations = (hasCreepingDeath) => {
  const durations = {
    [SPELLS.AGONY.id]: 18000,
    [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
    [SPELLS.SIPHON_LIFE_TALENT.id]: 15000,
    [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1.id]: 8000,
    [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2.id]: 8000,
    [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3.id]: 8000,
    [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4.id]: 8000,
    [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5.id]: 8000,
  };
  if (hasCreepingDeath) {
    Object.entries(durations).forEach(([key]) => {
      durations[key] *= 0.85;
    });
  }
  durations[SPELLS.PHANTOM_SINGULARITY_TALENT.id] = 16000;
  return durations;
};
