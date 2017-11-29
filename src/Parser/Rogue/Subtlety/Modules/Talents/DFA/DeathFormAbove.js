import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import Combatants from "Parser/Core/Modules/Combatants";
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink'; 

//DfA needs to be used with both Symbols of Death and Shadow Dance (Dark Shadow).
class DeathFormAbove extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasDarkShadow = false;
  dfaTimestamp = 0;
  dfaMaxWindow = 3000;

  failedCombos = 0;
  
  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.DEATH_FROM_ABOVE_TALENT.id);
    this.hasDarkShadow = this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }
  
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    //Find DfA, and save the timestamp. 
    if (spellId === SPELLS.DEATH_FROM_ABOVE_TALENT.id) {
        this.dfaTimestamp = event.timestamp;
    }
  }

  on_byPlayer_damage(event) {
    //Skip non dfa events
    if(event.timestamp > this.dfaTimestamp + this.dfaMaxWindow) return;

    //Find Eviscerate inside DFA
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.EVISCERATE.id) return;

    //If the Dfa Eviscerate hits without Symbols or Dark Shadow DFA - we have a problem!
    if (!this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id) 
    || ( this.hasDarkShadow && !this.combatants.selected.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id) )) {
      this.failedCombos += 1;    
    }   
  }

  
  suggestions(when) {
    when(this.failedCombos).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>          
          Always use <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} /> together with <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> and <SpellLink id={SPELLS.SHADOW_DANCE.id} />. 
          <br /> 
          Unless you hit multiple targets with your initial <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} /> hit, you should use <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are in the air. <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> is usually used before <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} />, but is some cases can also be used in the air. 
          </Wrapper>)
          .icon(SPELLS.DEATH_FROM_ABOVE_TALENT.icon)
          .actual(`${actual} Death from Above combos failed.`)
          .recommended(`${recommended} is recommended`)
          //Core rotation, should never happen.
          .major(0.1);
      });
    }
}

export default DeathFormAbove;
