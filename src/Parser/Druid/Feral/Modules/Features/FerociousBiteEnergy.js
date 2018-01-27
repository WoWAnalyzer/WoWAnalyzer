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
const LEEWAY_BETWEEN_CAST_AND_DAMAGE = 100; // in thousandths of a second

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
  
  biteDamageEvents = [];
  lowEnergyBiteCastEvents = [];
  
  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.FEROCIOUS_BITE.id) {
      return;
    }

    // Damage event only provides a feral druid's mana in classResources, not their energy.
    // So store damage and link it with energy information from cast event after parsing is complete.
    this.biteDamageEvents.push(event);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FEROCIOUS_BITE.id) {
      return;
    }
    this.biteCount++;

    const resource = event.classResources[0];
    if (resource.type !== RESOURCE_TYPES.ENERGY.id || !resource.cost) {
      // Ferocious Bite didn't consume energy, and so ignores the character's energy level.
      this.freeBiteCount++;
      return;
    }

    // 'amount' is energy before the ability uses it.
    if (resource.amount < ENERGY_FOR_FULL_DAMAGE_BITE) {
      this.energySpentOnBiteTotal += resource.amount;
      this.lowEnergyBiteCount++;
      this.lowEnergyBiteCastEvents.push(event);
    }
    else {
      this.energySpentOnBiteTotal += ENERGY_FOR_FULL_DAMAGE_BITE;
    }
  }

  on_finished() {
    this.lowEnergyBiteCastEvents.forEach((castEvent) => {
      const damageEvent = this.linearSearchByTimestamp(
        this.biteDamageEvents, castEvent.timestamp, LEEWAY_BETWEEN_CAST_AND_DAMAGE);
      if (damageEvent) {
        const actualDamage = damageEvent.amount + damageEvent.absorbed;
        const actualEnergy = castEvent.classResources[0].amount;
        const lostDamage = this.calcPotentialBiteDamage(actualDamage, actualEnergy) - actualDamage;
        this.lostDamageTotal += lostDamage;
      }
    });

    // No longer need these events, so let the GC eat them
    this.lowEnergyBiteCastEvents = null;
    this.biteDamageEvents = null;
  }

  /**
   * As we're searching for a timestamp in data ordered by timestamp, we could be much
   * more efficient than this linear search. But the collection is expected to be <100
   * in length, so a simple solution should be fine.
   */
  linearSearchByTimestamp(timestampedArray, targetTime, maxDifference) {
    let closest = null;
    let closestDifference = maxDifference;

    timestampedArray.forEach((item) =>{
      const difference = Math.abs(item.timestamp - targetTime);
      if (difference < closestDifference) {
        closest = item;
        closestDifference = difference;
      }
    });
    return closest;
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
