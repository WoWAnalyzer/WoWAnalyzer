import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { BERSERK_ENERGY_COST_MULTIPLIER, ENERGY_FOR_FULL_DAMAGE_BITE, MAX_BITE_DAMAGE_BONUS_FROM_ENERGY } from '../../constants';
import SpellEnergyCost from '../features/SpellEnergyCost';

const debug = false;
const LEEWAY_BETWEEN_CAST_AND_DAMAGE = 500; // in ms
const HIT_TYPES_TO_IGNORE = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];

/**
 * Although Ferocious Bite costs 25 energy it does extra damage with more energy available, up to double with a full 25 extra energy. This is among the most efficient uses of energy so it's recommended that feral druids wait for 50+ energy before using Bite.
 * Ferocious Bite consumes energy in an unusual way: the cast will consume 25 energy followed by a drain event consuming up to 25 more.
 * Berserk or Incarnation reduces energy costs by 40%. It reduces Bite's base cost correctly to 15 but reduces the drain effect to 13 (I expect a bug from when it used to reduce costs by 50%). So a player only needs to have 28 (or 30 if the bug is fixed) energy to get full damage from Ferocious Bite during Berserk rather than the usual 50. This module ignores the bug (the effect is very minor) and calculates everything as if the drain effect is correctly reduced to 15 rather than 13.
 */
class FerociousBiteEnergy extends Analyzer {
  static dependencies = {
    spellEnergyCost : SpellEnergyCost,
  }

  biteCount = 0;
  lostDamageTotal = 0;
  sumBonusEnergyFraction = 0;
  lastBiteCast = { timestamp: 0, event: undefined, energyForFullDamage: 50, energyUsedByCast: 25, energyAvailable: 100, isPaired: true };

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE), this._onBiteCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE), this._onBiteDamage);
  }

  _onBiteCast(event) {
    this.lastBiteCast = {
      timestamp: event.timestamp,
      event: event,
      energyForFullDamage: ENERGY_FOR_FULL_DAMAGE_BITE * (this._hasBerserkAtTime(event.timestamp) ? BERSERK_ENERGY_COST_MULTIPLIER : 1),
      energyUsedByCast: this._energyUsedByCast(event),
      energyAvailable: this._energyAvailable(event),
      isPaired: false,
    };
  }

  _onBiteDamage(event) {
    if (this.lastBiteCast.isPaired || event.timestamp > this.lastBiteCast.timestamp + LEEWAY_BETWEEN_CAST_AND_DAMAGE) {
      debug && this.warn(
        `Ferocious Bite damage event couldn't find a matching cast event. Last Ferocious Bite cast event was at ${this.lastBiteCast.timestamp}${this.lastBiteCast.isPaired ? ' but has already been paired' : ''}.`);
      return;
    }

    if (HIT_TYPES_TO_IGNORE.includes(event.hitType)) {
      // ignore parry/dodge/miss events as they'll refund energy anyway
      return;
    }

    if (this.lastBiteCast.energyAvailable < this.lastBiteCast.energyForFullDamage) {
      const actualDamage = event.amount + event.absorbed;
      const lostDamage = this._calcPotentialBiteDamage(actualDamage, this.lastBiteCast) - actualDamage;
      this.lostDamageTotal += lostDamage;
      this.sumBonusEnergyFraction += this._bonusEnergyFraction(this.lastBiteCast);

      const castEvent = this.lastBiteCast.event;
      castEvent.meta = event.meta || {};
      castEvent.meta.isInefficientCast = true;
      castEvent.meta.inefficientCastReason = `Used with low energy only gaining ${(this._bonusEnergyFraction(this.lastBiteCast) * 100).toFixed(1)}% of the potential bonus from extra energy, missing out on ${formatNumber(lostDamage)} damage.`;
    } else {
      this.sumBonusEnergyFraction += 1;
    }

    this.biteCount += 1;
    this.lastBiteCast.isPaired = true;
  }

  _hasBerserkAtTime(timestamp) {
    return this.selectedCombatant.hasBuff(SPELLS.BERSERK.id, timestamp) ||
      this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id, timestamp);
  }

  _energyAvailable(event) {
    const resource = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.ENERGY.id);
    if (!resource || !resource.amount) {
      debug && this.warn('Unable to get energy available from cast event.');
      return 100;
    }
    return resource.amount;
  }

  _energyUsedByCast(event) {
    if (!event.resourceCost || event.resourceCost[RESOURCE_TYPES.ENERGY.id] === undefined) {
      debug && this.warn('Unable to get energy cost from cast event.');
      return 0;
    }
    return event.resourceCost[RESOURCE_TYPES.ENERGY.id];
  }

  _bonusEnergyFraction(biteCast) {
    return Math.min(1, (biteCast.energyAvailable - biteCast.energyUsedByCast) / (biteCast.energyForFullDamage - biteCast.energyUsedByCast));
  }

  /**
   * Calculate what damage a bite could have done if it'd been given the maximum bonus energy
   * @param {number} actualDamage Observed damage of the Bite
   * @param {number} energy Energy available when Bite was cast
   */
  _calcPotentialBiteDamage(actualDamage, biteCast) {
    if (biteCast.energyAvailable >= biteCast.energyForFullDamage) {
      // Bite was already doing its maximum damage
      return actualDamage;
    }

    // the ideal multiplier would be 2, but because this bite didn't have enough energy the actual multiplier will be lower
    const actualMultiplier = 1 + (MAX_BITE_DAMAGE_BONUS_FROM_ENERGY * this._bonusEnergyFraction(biteCast));
    const damageBeforeMultiplier = actualDamage / actualMultiplier;
    return damageBeforeMultiplier * (1 + MAX_BITE_DAMAGE_BONUS_FROM_ENERGY);
  }

  get _dpsLostFromLowEnergyBites() {
    return (this.lostDamageTotal / this.owner.fightDuration) * 1000;
  }

  get _averageBonusEnergyFraction() {
    return this.biteCount > 0 ? (this.sumBonusEnergyFraction / this.biteCount) : 1.0;
  }

  get suggestionThresholds() {
    return {
      actual: this._averageBonusEnergyFraction,
      isLessThan: {
        minor: 1.0,
        average: 0.95,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const berserkOrIncarnationId = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) ?
      SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id :
      SPELLS.BERSERK.id;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You didn't always give <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> enough energy to get the full damage bonus. You should aim to have {ENERGY_FOR_FULL_DAMAGE_BITE} energy before using Ferocious Bite, or {(ENERGY_FOR_FULL_DAMAGE_BITE * BERSERK_ENERGY_COST_MULTIPLIER).toFixed(0)} during <SpellLink id={berserkOrIncarnationId} />. Your Ferocious Bite damage was reduced by {formatNumber(this._dpsLostFromLowEnergyBites)} DPS due to lack of energy.
        </>,
      )
        .icon(SPELLS.FEROCIOUS_BITE.icon)
        .actual(i18n._(t('druid.feral.suggestions.ferociousBite.efficiency')`${(actual * 100).toFixed(1)}% average damage bonus from energy on Ferocious Bite.`))
        .recommended(`${(recommended * 100).toFixed(1)}% is recommended.`));
  }
}

export default FerociousBiteEnergy;
