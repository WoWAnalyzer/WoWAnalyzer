import SPELLS from 'common/SPELLS';
import { ATONEMENT_COEFFICIENT } from './Constants';

/*
 * Wraps a spell calculation to accept the stats module
 * Essentially lets you compose modules with spell estimations
 */

const statWrapper = spellCalculation => stats => (...args) => {
  return spellCalculation(stats, ...args);
};

// Estimation of how much output an offensive penance bolt will do
export const OffensivePenanceBoltEstimation = statWrapper(
  (stats) => {
    const currentIntellect = stats.currentIntellectRating;
    const currentVers = 1 + stats.currentVersatilityPercentage;
    const currentMastery = 1 + stats.currentMasteryPercentage;
    const penanceCoefficient = SPELLS.PENANCE.coefficient;

    const penanceBoltDamage = Math.round(
      currentIntellect * penanceCoefficient * currentVers * currentMastery
    );

    const penanceBoltHealing = Math.round(
      penanceBoltDamage * ATONEMENT_COEFFICIENT
    );

    return {
      damage: penanceBoltDamage,
      healing: penanceBoltHealing,
    };
  }
);
