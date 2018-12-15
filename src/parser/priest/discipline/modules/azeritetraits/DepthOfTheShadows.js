import React from 'react';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';

import isAtonement from '../core/isAtonement';

/*
  refresh
*/

const DEPTH_OF_THE_SHADOWS_BONUS_MS = 2000;
const EVANGELISM_BONUS_MS = 6000;

class DepthOfTheShadows extends Analyzer {

  _bonusFromAtonementDuration = 0;
  _bonusFromDirectHealBuff = 0;
  _shadowMendCasts = [];
  _bonusHealingForSingleDepthStack = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEPTH_OF_THE_SHADOWS.id);

    this._bonusHealingForSingleDepthStack = this.selectedCombatant.traitsBySpellId[SPELLS.DEPTH_OF_THE_SHADOWS.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.DEPTH_OF_THE_SHADOWS.id, rank)[0], 0);

    this._bonusHealingForSingleDepthStack *= 2;
  }

  on_byPlayer_cast(event) {

    if (event.ability.guid === SPELLS.SHADOW_MEND.id) {
      event.lowerBound = event.timestamp + SPELLS.SHADOW_MEND.atonementDuration * 1000;
      event.upperBound = event.timestamp + SPELLS.SHADOW_MEND.atonementDuration * 1000 + DEPTH_OF_THE_SHADOWS_BONUS_MS;
      this._shadowMendCasts.push(event);
    }

    if (event.ability.guid === SPELLS.EVANGELISM_TALENT.id) {
      this._shadowMendCasts.forEach((cast, castIndex) => {

        if(event.timestamp < cast.lowerBound || event.timestamp > cast.upperBound) {
          cast.lowerBound += EVANGELISM_BONUS_MS;
        }

        cast.upperBound += EVANGELISM_BONUS_MS;
      });
    }
  }

  calculateBonusAtonement(event) {

    if(!isAtonement(event)) { return; }

    this._shadowMendCasts.forEach((cast, castIndex) => {
        if(event.targetID === cast.targetID && event.timestamp > cast.lowerBound && event.timestamp < cast.upperBound) {
            this._bonusFromAtonementDuration += event.amount;
        }
    });
  }

  on_byPlayer_heal(event) {

    if (event.ability.guid === SPELLS.SHADOW_MEND.id) {

      let _depthStacks = 0;

      const depthBuff = this.selectedCombatant.getBuff(SPELLS.DEPTH_OF_THE_SHADOWS_BUFF.id);
      if(depthBuff) { _depthStacks = depthBuff.stacks; }

      const bonusHealing = _depthStacks * this._bonusHealingForSingleDepthStack;

      if(!event.overheal || (event.overheal && event.overheal < bonusHealing)) {
        this._bonusFromDirectHealBuff += bonusHealing - (event.overheal || 0);
      }
    }

    this.calculateBonusAtonement(event);
  }

  statistic() {

    const fightDuration = this.owner.fightDuration;
    const total = this._bonusFromAtonementDuration + this._bonusFromDirectHealBuff;
    const totalPct = this.owner.getPercentageOfTotalHealingDone(total);
    const bonusFromAtonementPct = this.owner.getPercentageOfTotalHealingDone(this._bonusFromAtonementDuration);
    const bonusFromDirectHealBuffPct = this.owner.getPercentageOfTotalHealingDone(this._bonusFromDirectHealBuff);

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEPTH_OF_THE_SHADOWS.id}
        value={`${formatNumber(total / fightDuration * 1000)} HPS`}
        tooltip={
        `Depth of the Shadow provided <b>${formatPercentage(totalPct)}%</b> healing.
          <ul>
            <li><b>${formatPercentage(bonusFromAtonementPct)}%</b> from extended Atonement
            <li><b>${formatPercentage(bonusFromDirectHealBuffPct)}%</b> from direct shadow mend buff
          </ul>
        `}
      />
    );
  }
}

export default DepthOfTheShadows;
