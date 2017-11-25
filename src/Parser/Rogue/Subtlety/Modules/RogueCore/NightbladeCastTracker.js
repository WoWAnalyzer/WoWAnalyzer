import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';

import FilteredCastTracker from './../CastTracker/FilteredCastTracker';

class NightbladeCastTracker extends FilteredCastTracker {
    
  on_initialized() {
    this.trackedCasts[SPELLS.NIGHTBLADE.id] = {};    
  }
    

  applyCastEvent(event, aggregate) {
    super.applyCastEvent(event, aggregate);
    if(this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id)) {
      aggregate.symbolsCasts += 1;
    }
  }

  suggestions(when) { 
    const aggregate = this.getAggregate(SPELLS.NIGHTBLADE.id);
    if(!aggregate) return;

    const badRefreshShare = aggregate.symbolsCasts  / aggregate.casts;
    when(badRefreshShare).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> - cast <SpellLink id={SPELLS.EVISCERATE.id} /> instead. You can refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> early to make sure that its up for the full duration of <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You refreshed Nightblade ${aggregate.symbolsCasts} times during Symbols of Death.`)
        .recommended(`0 is recommend.`)
        .regular(0.1).major(0.2);
    });
  }
}

export default NightbladeCastTracker;