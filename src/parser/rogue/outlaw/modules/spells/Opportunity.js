import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';

class Opportunity extends Analyzer {
  delayedProcs = 0;
  
  get suggestionThresholds() {
    return {
      actual: this.delayedProcs,
      isGreaterThan: {
        minor: 0,
        average: 9,
        major: 14,
      },
      style: 'number',
    };
  }

  on_byPlayer_cast(event){
    if(event.ability.guid !== SPELLS.SINISTER_STRIKE.id){
      return;
    }

    if(this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)){
      this.delayedProcs += 1;
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You casted <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> while having an <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc. Try to prioritize <SpellLink id={SPELLS.PISTOL_SHOT.id} /> as your combo point builder when you have <SpellLink id={SPELLS.OPPORTUNITY.id} /> active to avoid the possibility of missing additional procs.</>)
        .icon(SPELLS.OPPORTUNITY.icon)
        .actual(`${actual} delayed procs`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default Opportunity;