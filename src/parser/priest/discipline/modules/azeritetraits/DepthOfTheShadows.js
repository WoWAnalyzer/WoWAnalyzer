import React from 'react';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';

import isAtonement from '../core/isAtonement';

const DEPTH_OF_THE_SHADOWS_BONUS_MS = 2000;
const EVANGELISM_BONUS_MS = 6000;

class DepthOfTheShadows extends Analyzer {

  _bonusFromAtonementDuration = 0;
  _bonusFromDirectHealBuff = 0;
  _bonusHealingForSingleDepthStack = 0;

  _lastCastIsShadowmend = false;
  _shadowmends = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEPTH_OF_THE_SHADOWS.id);

    this._bonusHealingForSingleDepthStack = this.selectedCombatant.traitsBySpellId[SPELLS.DEPTH_OF_THE_SHADOWS.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.DEPTH_OF_THE_SHADOWS.id, rank)[0], 0);
  }

  on_byPlayer_cast(event) {

    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SHADOW_MEND.id && spellId !== SPELLS.EVANGELISM_TALENT.id) {
      return;
    }

    if (spellId === SPELLS.SHADOW_MEND.id) {
      this._lastCastIsShadowmend = true;
    }

    if (spellId === SPELLS.EVANGELISM_TALENT.id){
      this._shadowmends.forEach((cast, castIndex) => {

        // We search for atonements applied with shadowmend that were in their
        // normal atonement window when evangelism was casted
        if(event.timestamp > cast.applyBuff.timestamp
        && event.timestamp < cast.applyBuff.timestamp + SPELLS.SHADOW_MEND.atonementDuration) {
          this._shadowmends[castIndex].wasExtendedByEvangelismPreDepthWindow = true;
        }
        // We search for atonements applied with shadowmend that were in their
        // depth window when evangelism was casted
        if(event.timestamp > cast.applyBuff.timestamp + SPELLS.SHADOW_MEND.atonementDuration
        && event.timestamp < cast.applyBuff.timestamp + SPELLS.SHADOW_MEND.atonementDuration + DEPTH_OF_THE_SHADOWS_BONUS_MS){
          this._shadowmends[castIndex].wasExtendedByEvangelismInDepthWindow = true;
        }
      });
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.ATONEMENT_BUFF.id){
      return;
    }

    if (this._lastCastIsShadowmend) {

      this._lastCastIsShadowmend = false;

      this._shadowmends.push({
        "applyBuff": event,
        "atonementEvents": [],
        "wasExtendedByEvangelismPreDepthWindow": false,
        "wasExtendedByEvangelismInDepthWindow": false,
      });
    }
  }

  // After discussing this with multiple other priests, we concluded that
  // atonements that were extended by evangelism in their depth window would
  // be counted for it's entire duration since you woudn't have had atonement
  // on the target in the first place. This is done here by not increasing
  // the lower bound if it was extended by evangelism in the depth window
  calculateBonusAtonement(event) {

    if(!isAtonement(event)) { return; }

    this._shadowmends.forEach((cast, castIndex) => {

      const lowerBound = cast.applyBuff.timestamp
                       + (cast.wasExtendedByEvangelismPreDepthWindow ? EVANGELISM_BONUS_MS : 0)
                       + SPELLS.SHADOW_MEND.atonementDuration;

      const upperBound = cast.applyBuff.timestamp
                       + (cast.wasExtendedByEvangelismPreDepthWindow || cast.wasExtendedByEvangelismInDepthWindow ? EVANGELISM_BONUS_MS : 0)
                       + SPELLS.SHADOW_MEND.atonementDuration
                       + DEPTH_OF_THE_SHADOWS_BONUS_MS;

      if(event.targetID === cast.applyBuff.targetID && event.timestamp > lowerBound && event.timestamp < upperBound) {
          this._bonusFromAtonementDuration += event.amount;
          this._shadowmends[castIndex].atonementEvents.push(event);
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
