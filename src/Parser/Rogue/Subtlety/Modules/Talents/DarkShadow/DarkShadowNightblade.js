import React from 'react';

import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import DarkShadow from './DarkShadow';
import DanceDamageTracker from './../../RogueCore/DanceDamageTracker';

class DarkShadowNightblade extends DarkShadow {  
  static dependencies = {
    ...DarkShadow.dependencies,
    danceDamageTracker: DanceDamageTracker,
  }

  constructor(...args) {
    super(...args);
    
    if(this.active) {
      this.danceDamageTracker.subscribeInefficientCast(
        [SPELLS.NIGHTBLADE],
        (_) => 'Dont cast Nightblade during Shadow Dance when using Dark Shadow talent.'
      ); 
    }   
  }

  suggestions(when) {
    const nightblade = this.danceDamageTracker.getAbility(SPELLS.NIGHTBLADE.id).casts;
    when(nightblade).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Do not cast <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are using <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />. </React.Fragment>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You cast Nightblade ${nightblade} times during Shadow Dance.`)
        .recommended(`${recommended} is recommended`)
        .major(0.5);
    });
  }
}

export default DarkShadowNightblade;
