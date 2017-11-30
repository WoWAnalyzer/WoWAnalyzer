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

  dfaTimestamp = 0;
  dfaMaxWindow = 3000;

  failedCombos = 0;
  
  on_initialized() {
    //Everyone plays Dark Shadow, so I'm not supporting non-dark shadow and just disabling this.
    this.active = this.combatants.selected.hasTalent(SPELLS.DEATH_FROM_ABOVE_TALENT.id)
      && this.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
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
    if(event.timestamp > this.dfaTimestamp + this.dfaMaxWindow || event.timestamp < this.dfaTimestamp) return;

    //Find Eviscerate inside DFA
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.EVISCERATE.id) return;

    //If the Dfa Eviscerate hits without Symbols or Dark Shadow Dance - we have a problem!
    if (!this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id) 
    || !this.combatants.selected.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id)) {
      this.failedCombos += 1;    
    }   
  }

  
  suggestions(when) {
    when(this.failedCombos).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>          
          Always use <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} /> together with <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> and <SpellLink id={SPELLS.SHADOW_DANCE.id} />. 
          <br /> 
          <SpellLink id={SPELLS.SHADOW_DANCE.id} /> is used when you are in the air, so that you do not loose uptime to the Death from Above animation (achieved by spamming the Shadow Dance button in the air).
          <br /> 
          <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> is used before <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} />. 
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
