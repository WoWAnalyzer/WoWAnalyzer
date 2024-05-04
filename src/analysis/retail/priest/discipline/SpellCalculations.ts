import StatTracker from 'parser/shared/modules/StatTracker';

import {
  ATONEMENT_COEFFICIENT,
  PENANCE_COEFFICIENCT,
  DISCIPLINE_DAMAGE_AURA_VALUE,
} from './constants';

/*
 * Wraps a spell calculation to accept the stats module
 * Essentially lets you compose modules with spell estimations
 */
const statWrapper =
  (spellCalculation: any) =>
  (stats: StatTracker) =>
  (...args: any[]) =>
    spellCalculation(stats, ...args);

// Returns the overhealing of a given spell
export const calculateOverhealing = (
  estimateHealing: number,
  healing: number,
  overhealing: number = 0,
) => {
  if (estimateHealing - healing < 0) {
    return 0;
  }

  return estimateHealing - healing;
};

// Estimation of how much output an offensive penance bolt will do
export const OffensivePenanceBoltEstimation = statWrapper((stats: StatTracker) => {
  const currentIntellect = stats.currentIntellectRating;
  const currentVers = 1 + stats.currentVersatilityPercentage;
  const currentMastery = 1 + stats.currentMasteryPercentage;
  const penanceCoefficient = PENANCE_COEFFICIENCT * DISCIPLINE_DAMAGE_AURA_VALUE;

  const penanceBoltDamage = Math.round(currentIntellect * penanceCoefficient * currentVers);

  const penanceBoltHealing = Math.round(penanceBoltDamage * ATONEMENT_COEFFICIENT * currentMastery);

  return {
    boltDamage: penanceBoltDamage,
    boltHealing: penanceBoltHealing,
  };
});
