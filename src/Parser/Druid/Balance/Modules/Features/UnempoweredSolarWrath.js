import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';

class UnempoweredSolarWrath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  badCasts = 0;

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id);
  }

  addBadCast(event){
    this.badCasts += 1;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'Solar Wrath was cast without Solar Empowerment while Lunar Empowerment was active. You should spend all your empowerments before casting unempowered spells.';
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SOLAR_WRATH_MOONKIN.id) {
      return;
    }
    if(!this.combatants.selected.hasBuff(SPELLS.SOLAR_EMP_BUFF.id) && this.combatants.selected.hasBuff(SPELLS.LUNAR_EMP_BUFF.id)){
      this.addBadCast(event);
    }
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
      return suggest(<React.Fragment>You cast {this.badCasts} unempowered <SpellLink id={SPELLS.SOLAR_WRATH.id} /> while you had <SpellLink id={SPELLS.LUNAR_EMP_BUFF.id} />. Try to always spend your empowerments before casting unempowered spells.</React.Fragment>)
        .icon(SPELLS.SOLAR_WRATH.icon)
        .actual(`${actual.toFixed(1)} Unempowered Solar Wraths with Lunar Empowerment per minute`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default UnempoweredSolarWrath;
