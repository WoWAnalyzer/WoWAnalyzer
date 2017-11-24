import React from 'react';

import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';

import SPELLS from 'common/SPELLS';
import ShadowDance from './../../RogueCore/ShadowDance';
import DarkShadow from './DarkShadow';


class DarkShadowNightblade extends DarkShadow {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    shadowDance: ShadowDance,
  };

  suggestions(when) { 
    const nightblade = this.shadowDance.totalCastsInDance.nightblade;
    when(nightblade).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not cast <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are using <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.id)
        .actual(`You cast Nightblade ${nightblade} times during Shadow Dance.`)
        .recommended(`0 is recommend.`)
        .regular(0).major(1);
    });
  }
}

export default DarkShadowNightblade;
