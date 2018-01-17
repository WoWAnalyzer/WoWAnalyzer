import React from 'react';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Abilities from '../Features/Abilities';

class BlackOxBrew extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  cdr = 0;
  wastedCDR = 0;
  casts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid !== SPELLS.BLACK_OX_BREW_TALENT.id) {
      return;
    }
    this.casts += 1;

    // reset all charges of ISB (and PB, but waiting on Abilities
    // refactor for linking the CDs...)
    //
    // loop until we've reset all the charges individually, recording
    // the amount of cooldown reduction for each charge.
    while(this.spellUsable.isOnCooldown(SPELLS.IRONSKIN_BREW.id)) {
      const cd = this.spellUsable.cooldownRemaining(SPELLS.IRONSKIN_BREW.id);
      this.cdr += cd;
      const wastedCDR = this.abilities.getExpectedCooldownDuration(SPELLS.IRONSKIN_BREW.id) - cd;
      this.wastedCDR += wastedCDR;
      this.spellUsable.endCooldown(SPELLS.IRONSKIN_BREW.id, false);
    }
  }

  get suggestionThreshold() {
    return {
      actual: this.wastedCDR / (this.cdr + this.wastedCDR),
      isGreaterThan: {
        minor: 0.10,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} icon /> usage can be improved. Try to use it only when all 3 charges of <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon /> / <SpellLink id={SPELLS.PURIFYING_BREW.id} icon /> are on cooldown.</Wrapper>)
          .icon(SPELLS.BLACK_OX_BREW_TALENT.icon)
          .actual(`${formatPercentage(actual)}% of Cooldown Reduction wasted`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default BlackOxBrew;
