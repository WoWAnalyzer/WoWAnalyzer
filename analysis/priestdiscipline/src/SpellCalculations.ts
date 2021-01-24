import StatTracker from 'parser/shared/modules/StatTracker';
import SinsOfTheMany from '@wowanalyzer/priest-discipline/src/modules/spells/SinsOfTheMany';

import { ATONEMENT_COEFFICIENT, PENANCE_COEFFICIENCT, SMITE_COEFFICIENT } from './constants';

// 50% dmg increase passive
const SMITE_DAMAGE_BUFF = 0.5;

/*
 * Wraps a spell calculation to accept the stats module
 * Essentially lets you compose modules with spell estimations
 */
const statWrapper = (spellCalculation: any) => (stats: StatTracker) => (...args: any[]) => spellCalculation(stats, ...args);

// Returns the overhealing of a given spell
export const calculateOverhealing = (estimateHealing: number, healing: number, overhealing: number = 0) => {
  if (estimateHealing - healing < 0) {
    return 0;
  }

  return estimateHealing - healing;
};

// Estimation of how much output an offensive penance bolt will do
export const OffensivePenanceBoltEstimation = statWrapper(
  (stats: StatTracker) => {
    const currentIntellect = stats.currentIntellectRating;
    const currentVers = 1 + stats.currentVersatilityPercentage;
    const currentMastery = 1 + stats.currentMasteryPercentage;
    const penanceCoefficient = PENANCE_COEFFICIENCT;

    const penanceBoltDamage = Math.round(
      currentIntellect * penanceCoefficient * currentVers,
    );

    const penanceBoltHealing = Math.round(
      penanceBoltDamage * ATONEMENT_COEFFICIENT * currentMastery,
    );

    return {
      boltDamage: penanceBoltDamage,
      boltHealing: penanceBoltHealing,
    };
  },
);

// Estimation of how much output a Smite will do
export const SmiteEstimation = (stats: StatTracker, sins: SinsOfTheMany) => () => {
    const currentIntellect = stats.currentIntellectRating;
    const currentVers = 1 + stats.currentVersatilityPercentage;
    const currentMastery = 1 + stats.currentMasteryPercentage;
    const smiteCoefficient = SMITE_COEFFICIENT;

    let smiteDamage = currentIntellect * smiteCoefficient;

    smiteDamage = Math.round(
      smiteDamage * currentVers * (1 + sins.currentBonus) * (1 + SMITE_DAMAGE_BUFF),
    );

    const smiteHealing = Math.round(
      smiteDamage * ATONEMENT_COEFFICIENT * currentMastery,
    );

    return {
      smiteDamage,
      smiteHealing,
    };
  }
