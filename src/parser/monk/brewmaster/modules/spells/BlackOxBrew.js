import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from '../Abilities';

class BlackOxBrew extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  cdr = 0;
  wastedCDR = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
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
    const spellId = SPELLS.PURIFYING_BREW.id;
    while(this.spellUsable.isOnCooldown(spellId)) {
      const cd = this.spellUsable.cooldownRemaining(spellId);
      this.cdr += cd;
      const wastedCDR = this.abilities.getExpectedCooldownDuration(spellId, this.spellUsable.cooldownTriggerEvent(spellId)) - cd;
      this.wastedCDR += wastedCDR;
      this.spellUsable.endCooldown(spellId, false);
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
        return suggest(<>Your <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> usage can be improved.</>)
          .icon(SPELLS.BLACK_OX_BREW_TALENT.icon)
          .actual(`${formatPercentage(actual)}% of Cooldown Reduction wasted`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default BlackOxBrew;
