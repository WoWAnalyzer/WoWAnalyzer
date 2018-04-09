import React from 'react';

import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class Starlord extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.STARLORD_TALENT.id);
  }

  get starsurgesPerMinute(){
    return this.abilityTracker.getAbility(SPELLS.STARSURGE_MOONKIN.id).casts / this.owner.fightDuration * 1000 * 60 || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.starsurgesPerMinute,
      isLessThan: {
        minor: 5,
        average: 2.5,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper><SpellLink id={SPELLS.STARLORD_TALENT.id} /> is only useful if you are casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> often. If you are spending your Astral Power primarily on <SpellLink id={SPELLS.STARFALL_CAST.id} />, consider using <SpellLink id={SPELLS.WARRIOR_OF_ELUNE_TALENT.id} /> instead.</Wrapper>)
        .icon(SPELLS.STARLORD_TALENT.icon)
        .actual(`${actual.toFixed(2)} Starsurges per minute.`)
        .recommended(`${recommended.toFixed(2)} is recommended`);
    });
  }
}

export default Starlord;
