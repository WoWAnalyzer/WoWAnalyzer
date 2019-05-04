import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import RollTheBonesCastTracker from '../features/RollTheBonesCastTracker';

const MID_TIER_REFRESH_TIME = 11000;
const HIGH_TIER_REFRESH_TIME = 3000;

/**
 * Roll the Bones is pretty complex with a number of rules around when to use it. I've done my best to break this down into four main suggestions
 * Ruthless Precision and Grand Melee are the two 'good' buffs. The other four are 'bad' buffs
 * 
 * 1 - Uptime (handled in separate module, as close to 100% as possible)
 * 2 - Low value rolls (1 'bad' buff, reroll as soon as you can)
 * 3 - Mid value rolls (2 'bad' buffs, reroll at the pandemic window)
 * 4 - High value rolls (1 'good' buff, 2 buffs where at least one is a 'good' buff, or 5 buffs, keep as long as you can, rerolling under 3 seconds is considered fine)
 */
class RollTheBonesEfficiency extends Analyzer {
  static dependencies = {
    rollTheBonesCastTracker: RollTheBonesCastTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id);
  }

  delayedLowValueRolls = 0;

  get goodMidValueRolls(){
    // todo get the actual pandemic window. it's tricky because it's based on the next cast, and it's not really important that the player is exact anyway
    return this.rollTheBonesCastTracker.rolltheBonesCastValues.mid
      .filter(cast => this.rollTheBonesCastTracker.castRemainingDuration(cast) > HIGH_TIER_REFRESH_TIME && this.rollTheBonesCastTracker.castRemainingDuration(cast) < MID_TIER_REFRESH_TIME).length;
  }

  get goodHighValueRolls(){
    return this.rollTheBonesCastTracker.rolltheBonesCastValues.high
      .filter(cast => this.rollTheBonesCastTracker.castRemainingDuration(cast) <= HIGH_TIER_REFRESH_TIME).length;
  }

  on_byPlayer_cast(event){
    if(event.ability.guid !== SPELLS.DISPATCH.id && event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id){
      return;
    }

    const lastCast = this.rollTheBonesCastTracker.lastCast;
    if(lastCast && this.rollTheBonesCastTracker.categorizeCast(lastCast) === 'low'){
      this.delayedLowValueRolls += 1;
    }
  }

  // Percentage of bad rolls that weren't rerolled right away, meaning a different finisher was cast first
  // Inverted to make all three suggestions consistent
  get lowValueRoll(){
    return {
      pass: this.rollTheBonesCastTracker.rolltheBonesCastValues.low.length - this.delayedLowValueRolls,
      total: this.rollTheBonesCastTracker.rolltheBonesCastValues.low.length,
    };
  }

  // Percentage of ok rolls that were rerolled at or below pandemic, but above 3 seconds
  get midValueRoll(){
    return {
      pass: this.goodMidValueRolls,
      total: this.rollTheBonesCastTracker.rolltheBonesCastValues.mid.length,
    };
  }

  // Percentage of good rolls that were rerolled below 3 seconds
  get highValueRoll(){
    return {
      pass: this.goodHighValueRolls,
      total: this.rollTheBonesCastTracker.rolltheBonesCastValues.high.length,
    };
  }

  suggestionThreshold(value){
    return {
      actual: value.total === 0 ? 1 : value.pass / value.total,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  rollSuggest(when, value, suggestNode){
    when(this.suggestionThreshold(value)).addSuggestion((suggest, actual, recommended) => {
      return suggest(suggestNode)
        .icon(SPELLS.ROLL_THE_BONES.icon)
        .actual(`${formatPercentage(actual)}% (${value.pass} out of ${value.total}) efficient rerolls`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  suggestions(when) {
    this.rollSuggest(when, this.lowValueRoll, <>Your efficiency with refreshing <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> after a low value roll could be improved. <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> and <SpellLink id={SPELLS.GRAND_MELEE.id} /> are your highest value buffs from <SpellLink id={SPELLS.ROLL_THE_BONES.id} />. If you get a single buff and it's not one of those, try to reroll it as soon as you can.</>);
    this.rollSuggest(when, this.midValueRoll, <>Your efficiency with refreshing <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> after a mid value roll could be improved. <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> and <SpellLink id={SPELLS.GRAND_MELEE.id} /> are your highest value buffs from <SpellLink id={SPELLS.ROLL_THE_BONES.id} />. If you get two buffs and neither is one of those, try to reroll them once you reach the pandemic window, at about 9-10 seconds remaining.</>);
    this.rollSuggest(when, this.highValueRoll, <>Your efficiency with refreshing <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> after a high value roll could be improved. <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> and <SpellLink id={SPELLS.GRAND_MELEE.id} /> are your highest value buffs from <SpellLink id={SPELLS.ROLL_THE_BONES.id} />. If you ever roll one of those (especially with a 5 buff roll!), try to leave the buff active as long as possible, refreshing with less than 3 seconds remaining.</>);
  }
}

export default RollTheBonesEfficiency;