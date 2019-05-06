import React from 'react';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = false;

class StreakingStars extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };
  /**
   * Streaking stars works like windwalker mastery but only during incarn
   */

  bonusDamage = 0;
  lastSpell;
  totalCast = 0;
  badCasts = 0;

  getAbility = spellId => this.abilityTracker.getAbility(spellId);


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STREAKING_STARS.id);
    if (!this.active) {
      return;
    }
    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.STREAKING_STARS.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.STREAKING_STARS.id, rank);
        debug && this.log(`Rank ${rank}, damage ${damage}`);
        return total + damage;
      }, 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    
    if(!(this.selectedCombatant.hasBuff(SPELLS.CELESTIAL_ALIGNMENT.id) || this.selectedCombatant.hasBuff(SPELLS.CELESTIAL_ALIGNMENT.id))) {
      if(spellId === this.lastSpell){
        this.badCast += 1;
      }
      this.totalCast += 1;
    }

    this.lastSpell = spellId;

  }

  on_byPlayer_damage(event){
    
    const spellId = event.ability.guid;
    const versPerc = this.statTracker.currentVersatilityPercentage;
    let critMod = 1;

    if(spellId !== SPELLS.STREAKING_STARS.id){
      return;
    }

    if(event.hitType === HIT_TYPES.CRIT){
      critMod = 2;
    }

    this.bonusDamage += this.bonus * (1 + versPerc) * critMod;
  }

  get scruffedCasts(){
    console.log(this.badCasts);
    console.log(this.totalCast);
    console.log(this.badCasts/this.totalCast);
    return this.badCasts/this.totalCast;
  }

  get suggestionThresholds(){
    return {
      actual: this.scruffedCasts,
      isLessThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    // when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
    //   return suggest(
    //     <>
    //       You casted the same spell during  can be improved. You should aim to cast solar wrath after every spell during CELESTIAL ALIGNMENT.
    //     </>
    //   )
    //     .icon(SPELLS.STREAKING_STARS.icon)
    //     .actual(`number of times you casted the same spell twice in a row during CELESTIAL ALIGNMENT`)
    //     .recommended(`0k average mana saved is recommended`);
    // });
  }
}

export default StreakingStars;
