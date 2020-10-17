import SPELLS from 'common/SPELLS';

// TODO remove all instances of this array with the single debuff; changed in Shadowlands again
export const UNSTABLE_AFFLICTION_DEBUFFS = [
  SPELLS.UNSTABLE_AFFLICTION,
];

export const getDotDurations = (hasCreepingDeath) => {
  const durations = {
    [SPELLS.AGONY.id]: 18000,
    [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
    [SPELLS.SIPHON_LIFE_TALENT.id]: 15000,
    [SPELLS.UNSTABLE_AFFLICTION.id]: 16000,
  };
  if (hasCreepingDeath) {
    Object.entries(durations).forEach(([key]) => {
      durations[key] *= 0.85;
    });
  }
  durations[SPELLS.PHANTOM_SINGULARITY_TALENT.id] = 16000;
  return durations;
};
