import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

const RUNE_DURATION = 10;

class RuneOfPower extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
  }

  get uptimeMS() {
    return this.combatants.selected.getBuffUptime(SPELLS.RUNE_OF_POWER_BUFF.id);
  }

  get roundedSecondsPerCast() {
    return ((this.uptimeMS / this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_BUFF.id).casts) / 1000).toFixed(1);
  }

  get roundedSecondsSuggestionThresholds() {
    return {
      actual: this.roundedSecondsPerCast,
      isLessThan: {
        minor: RUNE_DURATION,
        average: RUNE_DURATION - 1,
        major: RUNE_DURATION - 3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_BUFF.id).casts > 0) {
      when(this.roundedSecondsSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You sometimes aren't standing in your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> for its full duration. Try to only use it when you know you won't have to move for the duration of the effect.</Wrapper>)
            .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
            .actual(`Average ${this.roundedSecondsPerCast}s standing in each Rune of Power`)
            .recommended(`the full duration of ${formatNumber(RUNE_DURATION)}s is recommended`);
        });
    }
  }
}

export default RuneOfPower;
