import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SCHOOLS from 'game/MAGIC_SCHOOLS';

const debug = false;

class SpellReflect extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };
  
  magicDamage = 0;
  magicDamageReduced = 0;
  totalDamage = 0;

  on_toPlayer_damage(event){
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      this.magicDamage += event.unmitigatedAmount || 0;
      if(this.selectedCombatant.hasBuff(SPELLS.SPELL_REFLECTION.id)){
        this.magicDamageReduced += event.unmitigatedAmount || 0;
      }
    }
  }

  on_fightend(){
    if(debug){
      console.log(`magic damage ${this.magicDamage}`);
      console.log(`magic damage with mit ${this.magicDamageReduced}`);
      console.log(`total damage ${this.totalDamage}`);
    }
  }

  get suggestionThresholds(){
    return {
      actual: this.magicDamageReduced/this.magicDamage,
      isLessThan: {
        minor: .25,
        average: .15,
        major: .05,
      },
      style: 'percentage',
    };
  }
 
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SPELL_REFLECTION.id} />  more often when magic damage is going out to take less damage.
        </>,
      )
        .icon(SPELLS.SPELL_REFLECTION.icon)
        .actual(`${formatPercentage(actual)} % magic damage With Spell Reflect Up`)
        .recommended(`${formatPercentage(recommended)} % recommended`);
    });
  }
}

export default SpellReflect;
