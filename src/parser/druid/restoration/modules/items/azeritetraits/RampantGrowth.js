import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import Combatants from 'parser/shared/modules/Combatants';

import { getSpellInfo } from '../../../SpellInfo';
import StatWeights from '../../features/StatWeights';
import Mastery from '../../core/Mastery';
import {getPrimaryStatForItemLevel, findItemLevelByPrimaryStat} from "./common";
import Events from 'parser/core/Events';

const CRIT_EFFECT = 2;
const REGROWTH_DURATION = 12000;

/**
 Regrowth heals for 696 more over its duration, and its healing over time effect
 also applies to the target of your Lifebloom.

 How we're calculating the value of Rampant Growth:
 1. For every Regrowth healing event, credit the Rampant Growth HoT part to Rampant Growth (discounting overhealing).
 2. For every Regrowth healing event, if the target has LB credit the entire Regrowth HoT to Rampant Growth.
 3. For every healing event, if the target has LB and Regrowth credit one stack of mastery healing to Rampant Growth.
 4. For every Regrowth cast, if the target has LB "ban" all credits from point 2 and 3 for the next 12 seconds.
 */

class RampantGrowth extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
    mastery: Mastery,
    combatants: Combatants,
  };

  healingFromHotIncrease = 0;
  healingFromFreeRegrowthHoT = 0;
  healingFromFreeRegrowthMastery = 0;
  avgItemLevel = 0;
  traitLevel = 0;
  healingIncreasePerTick = 0;
  banPeriod = 0;
  discountHealing = 0;
  directRegrowthCastsOnLB = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.RAMPANT_GROWTH_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.RAMPANT_GROWTH_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.RAMPANT_GROWTH_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.RAMPANT_GROWTH_TRAIT.id].length;
      this.healingIncreasePerTick = this.selectedCombatant.traitsBySpellId[SPELLS.RAMPANT_GROWTH_TRAIT.id]
        .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.RAMPANT_GROWTH_TRAIT.id, rank)[0], 0);
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHeal);
  }

  onCast(event) {
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }

    // If regrowth was cast on the LB target, disregard regrowth base HoT/mastery healing on that target for 12 seconds.
    if(combatant.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, event.timestamp, 200, null, this.owner.playerId)) {
      this.directRegrowthCastsOnLB += 1;
      this.banPeriod = event.timestamp + REGROWTH_DURATION;
    } else {
      this.banPeriod = 0;
    }
  }

  onHeal(event) {
    const spellId = event.ability.guid;
    const combatant = this.combatants.players[event.targetID];

    // If target has LB and Regrowth and is not marked under the ban period, credit one stack of mastery healing given that the heal scales with mastery.
    if(combatant
      && combatant.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, event.timestamp, 200, null, this.owner.playerId)
      && combatant.hasBuff(SPELLS.REGROWTH.id, event.timestamp, 200, null, this.owner.playerId)
      && getSpellInfo(spellId).mastery) {
      const oneMasteryStackHealing = this.mastery.decomposeHeal(event).oneStack;
      if(this.banPeriod < event.timestamp) {
        this.healingFromFreeRegrowthMastery += (oneMasteryStackHealing || 0);
      } else {
        this.discountHealing += (oneMasteryStackHealing || 0);
      }
    }

    if (spellId !== SPELLS.REGROWTH.id || !event.tick) {
      return;
    }

    // If target has LB and Regrowth and is not marked under the ban period, credit all regrowth HoT.
    if(combatant && combatant.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, event.timestamp, 200, null, this.owner.playerId)) {
      if (this.banPeriod < event.timestamp) {
        this.healingFromFreeRegrowthHoT += event.amount;
        // No need to check the healing from HoT increase as it's already included in the statement above
        return;
      } else {
        this.discountHealing += event.amount;
      }
    }
    // Even if we are in the "banPeriod" the increased HoT healing still applies and should be credited.
    if(event.hitType === HIT_TYPES.CRIT) {
      this.healingFromHotIncrease += Math.max((this.healingIncreasePerTick * CRIT_EFFECT) - (event.overheal || 0), 0);
    } else {
      this.healingFromHotIncrease += Math.max((this.healingIncreasePerTick) - (event.overheal || 0), 0);
    }
  }

  statistic(){
    const healingFromHotIncrease = this.owner.getPercentageOfTotalHealingDone(this.healingFromHotIncrease);
    const freeRegrowthHoT = this.owner.getPercentageOfTotalHealingDone(this.healingFromFreeRegrowthHoT);
    const freeRegrowthMastery = this.owner.getPercentageOfTotalHealingDone(this.healingFromFreeRegrowthMastery);

    const throughputPercent = healingFromHotIncrease + freeRegrowthHoT + freeRegrowthMastery;
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * throughputPercent * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.RAMPANT_GROWTH_TRAIT.id}
        value={`${formatPercentage(throughputPercent)} %`}
        tooltip={(
          <>
            Healing from HoT increase: {formatPercentage(healingFromHotIncrease)}% <br />
            Healing from free Regrowth HoT: {formatPercentage(freeRegrowthHoT)}% <br />
            Healing from free Regrowth mastery stack: {formatPercentage(freeRegrowthMastery)}% <br />
            Healing missed from free Regrowth because of direct Regrowth casts on LB target: {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.discountHealing))}% (# of times: {this.directRegrowthCastsOnLB}) <br />
            Rampant Growth gave you equivalent to <strong>{formatNumber(intGain)}</strong> ({formatNumber(intGain/this.traitLevel)} per level) Intellect.
            This is worth roughly <strong>{formatNumber(ilvlGain)}</strong> ({formatNumber(ilvlGain/this.traitLevel)} per level) item levels.
          </>
        )}
      />
    );
  }
}

export default RampantGrowth;
