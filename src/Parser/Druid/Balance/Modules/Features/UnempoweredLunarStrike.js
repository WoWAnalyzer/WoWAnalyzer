import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';

const TARGETS_FOR_GOOD_CAST = 4;

class UnempoweredLunarStrike extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  badCasts = 0;
  lastCast = null;
  lastCastBuffed = false;
  hits = 0;

  checkCast(){
    if(this.lastCastBuffed || this.hits >= TARGETS_FOR_GOOD_CAST || this.lastCast === null){
      return;
    }
    this.badCasts += 1;
    this.lastCast.meta = this.lastCast.meta || {};
    this.lastCast.meta.isInefficientCast = true;
    this.lastCast.meta.inefficientCastReason = 'Lunar Strike was cast without Lunar Empowerment, Owlkin Frenzy and Warrior of Elune and hit less than 4 targets.';
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.LUNAR_STRIKE.id) {
      return;
    }
    this.checkCast();
    this.lastCast = event;
    this.lastCastBuffed = this.combatants.selected.hasBuff(SPELLS.LUNAR_EMP_BUFF.id)
      || this.combatants.selected.hasBuff(SPELLS.OWLKIN_FRENZY.id)
      || this.combatants.selected.hasBuff(SPELLS.WARRIOR_OF_ELUNE_TALENT.id);
    this.hits = 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.LUNAR_STRIKE.id) {
      return;
    }
    this.hits += 1;
  }

  on_finished() {
    this.checkCast();
  }

  get badCastsPerMinute(){
    return ((this.badCasts) / (this.owner.fightDuration / 1000)) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCastsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You cast {this.badCasts} unempowered and non instant cast <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> that hit less than 4 targets. Always prioritize <SpellLink id={SPELLS.SOLAR_WRATH.id} /> as a filler when none of those conditions are met.</Wrapper>)
        .icon(SPELLS.LUNAR_STRIKE.icon)
        .actual(`${actual.toFixed(1)} Unempowered Lunar Strikes per minute`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default UnempoweredLunarStrike;
