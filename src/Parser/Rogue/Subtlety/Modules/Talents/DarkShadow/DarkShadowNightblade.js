import React from 'react';

import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';

import SPELLS from 'common/SPELLS';
import ShadowDanceCastTracker from './../../RogueCore/ShadowDanceCastTracker';
import DarkShadow from './DarkShadow';


class DarkShadowNightblade extends DarkShadow {
  static dependencies = {
    shadowDanceCastTracker: ShadowDanceCastTracker,
  };

  suggestions(when) { 
    const aggregate = this.shadowDanceCastTracker.getAggregate(SPELLS.NIGHTBLADE.id);
    if(!aggregate) return;

    const nightblade = aggregate.danceCasts;
    when(nightblade).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not cast <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are using <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You cast Nightblade ${nightblade} times during Shadow Dance.`)
        .recommended(`0 is recommend.`)
        .major(0.5);
    });
  }
}

export default DarkShadowNightblade;
