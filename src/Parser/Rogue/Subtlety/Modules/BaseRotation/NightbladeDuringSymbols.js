import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

import SymbolsDamageTracker from './../RogueCore/SymbolsDamageTracker';

class NightbladeDuringSymbols extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    symbolsDamageTracker: SymbolsDamageTracker,
  };

  suggestions(when) { 
    const total = this.damageTracker.getAbility(SPELLS.NIGHTBLADE.id);
    const filtered = this.symbolsDamageTracker.getAbility(SPELLS.NIGHTBLADE.id);

    const badRefreshShare = filtered.casts / total.casts;
    when(badRefreshShare).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> - cast <SpellLink id={SPELLS.EVISCERATE.id} /> instead. You can refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> early to make sure that its up for the full duration of <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You refreshed Nightblade ${filtered.casts} times during Symbols of Death.`)
        .recommended(`0 is recommend.`)
        .regular(0.1).major(0.2);
    });
  }
}
export default NightbladeDuringSymbols;