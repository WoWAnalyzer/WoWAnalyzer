import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatNumber } from 'common/format';

const ENERGY_MIN_USED_BY_BITE = 25;
const ENERGY_FOR_FULL_DAMAGE_BITE = 50;
const MAX_DAMAGE_BONUS_FROM_ENERGY = 1.0;
const LEEWAY_BETWEEN_CAST_AND_DAMAGE = 500; // in thousandths of a second

const debug = false;

/**
 * Although Ferocious Bite costs 25 energy, it does up to double damage if the character has more.
 * It's recommended that feral druids use Bite when at 50 energy or higher.
 * An exception to this is when the bonus from 4-piece T21 is active, which makes Bite cost no
 * energy and ignore the current energy level.
 */
class FerociousBiteEnergy extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
  biteCount = 0;
  freeBiteCount = 0;
  lowEnergyBiteCount = 0;
  lostDamageTotal = 0;
  energySpentOnBiteTotal = 0;
  
  lastBiteCast = { timestamp: 0, energy: 0, isPaired: true };

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FEROCIOUS_BITE.id) {
      return;
    }
    
    this.lastBiteCast.timestamp = event.timestamp;
    this.lastBiteCast.energy = this.getEnergyUsedByBite(event);
    this.lastBiteCast.isPaired = false;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.FEROCIOUS_BITE.id) {
      return;
    }
    if (this.lastBiteCast.isPaired || event.timestamp > this.lastBiteCast.timestamp + LEEWAY_BETWEEN_CAST_AND_DAMAGE) {
      debug && console.warn(
        `Ferocious Bite damage event at ${event.timestamp} couldn't find a matching cast event. Last Ferocious Bite cast event was at ${this.lastBiteCast.timestamp}${this.lastBiteCast.isPaired ? ' but has already been paired' : ''}.`);
      return;
    }
    
    if (this.lastBiteCast.energy === 0) {
      this.freeBiteCount++;
    }
    else if (this.lastBiteCast.energy < ENERGY_FOR_FULL_DAMAGE_BITE) {
      this.lowEnergyBiteCount++;
      this.energySpentOnBiteTotal += this.lastBiteCast.energy;
      const actualDamage = event.amount + event.absorbed;
      const lostDamage = this.calcPotentialBiteDamage(actualDamage, this.lastBiteCast.energy) - actualDamage;
      this.lostDamageTotal += lostDamage;
    }
    else {
      this.energySpentOnBiteTotal += this.lastBiteCast.energy;
    }
    this.biteCount++;
    this.lastBiteCast.isPaired = true;
  }

  getEnergyUsedByBite(event) {
    const resource = event.classResources[0];
    if (resource.type !== RESOURCE_TYPES.ENERGY.id || !resource.cost) {
      return 0;
    }
    else if (resource.amount < ENERGY_FOR_FULL_DAMAGE_BITE) {
      return resource.amount;
    }
    else {
      return ENERGY_FOR_FULL_DAMAGE_BITE;
    }
  }

  /**
   * Calculate what damage a bite could have done if it'd been given the maximum bonus energy
   * @param {number} actualDamage Observed damage of the Bite
   * @param {number} energy Energy available when Bite was cast
   */
  calcPotentialBiteDamage(actualDamage, energy) {
    if (energy >= ENERGY_FOR_FULL_DAMAGE_BITE) {
      // Bite was already doing its maximum damage
      return actualDamage;
    }

    const actualMulti = 1 + MAX_DAMAGE_BONUS_FROM_ENERGY * (energy - ENERGY_MIN_USED_BY_BITE) /
      (ENERGY_FOR_FULL_DAMAGE_BITE - ENERGY_MIN_USED_BY_BITE);
    const baseDamage = actualDamage / actualMulti;
    return baseDamage * (1 + MAX_DAMAGE_BONUS_FROM_ENERGY);
  }

  get dpsLostFromLowEnergyBites() {
    return (this.lostDamageTotal / this.owner.fightDuration) * 1000;
  }

  get averageEnergySpentOnBite() {
    const notFreeBiteCount = this.biteCount - this.freeBiteCount;
    return notFreeBiteCount > 0 ? this.energySpentOnBiteTotal / notFreeBiteCount : ENERGY_FOR_FULL_DAMAGE_BITE;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageEnergySpentOnBite,
      isLessThan: {
        minor: ENERGY_FOR_FULL_DAMAGE_BITE,
        average: ENERGY_FOR_FULL_DAMAGE_BITE - 5,
        major: ENERGY_FOR_FULL_DAMAGE_BITE - 10,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <Wrapper>
          You used an average of {actual.toFixed(1)} energy on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />. You should aim to always have {ENERGY_FOR_FULL_DAMAGE_BITE} energy available when using Ferocious Bite. Your Ferocious Bite damage was reduced by {formatNumber(this.dpsLostFromLowEnergyBites)} DPS due to lack of energy.
        </Wrapper>
      )
        .icon(SPELLS.FEROCIOUS_BITE.icon)
        .actual(`${actual.toFixed(1)} average energy spent on Ferocious Bite.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default FerociousBiteEnergy;
