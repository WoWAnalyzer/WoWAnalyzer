import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

import SymbolsDamageTracker from './../RogueCore/SymbolsDamageTracker';

class NightbladeDuringSymbols extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    symbolsDamageTracker: SymbolsDamageTracker,
  };
  
  constructor(...args) {
    super(...args);
    

    this.symbolsDamageTracker.subscribeInefficientCast(
      [SPELLS.NIGHTBLADE],
      (s) => `Do not refresh nightblade during Symbols.`
    );
  }

  get thresholds() {
    const total = this.damageTracker.getAbility(SPELLS.NIGHTBLADE.id);
    const filtered = this.symbolsDamageTracker.getAbility(SPELLS.NIGHTBLADE.id);

    return {
      actual: filtered.casts,
      isGreaterThan: {
        minor: 0,
        average: total.casts/10,
        major: total.casts/5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.thresholds).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Do not refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> - cast <SpellLink id={SPELLS.EVISCERATE.id} /> instead. You can refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> early to make sure that its up for the full duration of <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />. </React.Fragment>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You refreshed Nightblade ${actual} times during Symbols of Death.`)
        .recommended(`${recommended} is recommended`);
    });
  }
}
export default NightbladeDuringSymbols;
