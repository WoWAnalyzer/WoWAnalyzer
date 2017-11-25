import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';

import FilteredCastTracker from './../CastTracker/FilteredCastTracker';

class SymbolsCastTracker extends FilteredCastTracker {
    
  on_initialized() {
    this.trackedCasts[SPELLS.NIGHTBLADE.id] = {};    
  }
  
  shouldProcessCastEvent(event) {
    return super.shouldProcessCastEvent(event) && 
    this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
 

  suggestions(when) { 
    const casts = this.totalCasts;
    when(casts).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> - cast <SpellLink id={SPELLS.EVISCERATE.id} /> instead. You can refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> early to make sure that its up for the full duration of <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You refreshed Nightblade ${casts} times during Symbols of Death.`)
        .recommended(`0 is recommend.`)
        .regular(0).major(1);
    });
  }
}

export default SymbolsCastTracker;