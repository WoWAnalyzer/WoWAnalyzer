import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellUsable from '../Features/SpellUsable';

class WhirlwindAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  whirlwinds = 0;
  wastedWhirlwinds = 0;

  on_byPlayer_cast(event) {
    if(SPELLS.WHIRLWIND.id !== event.ability.guid) {
      return;
    }

    this.whirlwinds += 1;

    const weightedBlades3Stacks = this.combatants.selected.hasBuff(SPELLS.WEIGHTED_BLADES.id) && this.combatants.selected.getBuff(SPELLS.WEIGHTED_BLADES.id).stacks === 3;

    if(!this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id) && this.spellUsable.isAvailable(SPELLS.COLOSSUS_SMASH.id)) {
      // If whirlwind was used when colossus smash could have been used to apply shattered defenses, flag it.
      this.wastedWhirlwinds += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Whirlwind was used without Shattered Defenses while Colossus Smash was available.';
    } else if(this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id) && !weightedBlades3Stacks) {
      // If the player used whirlwind when they could have used mortal strike, flag it, unless 3 stacks of weighted blades were active.
      this.wastedWhirlwinds += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Whirlwind was used while Mortal Strike was available.';
    }
  }

  get wastedWhirlwindThresholds() {
    return {
			actual: this.wastedWhirlwinds / this.whirlwinds,
			isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
			style: 'percentage',
		};
  }

  suggestions(when) {
    when(this.wastedWhirlwindThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try to avoid using <SpellLink id={SPELLS.WHIRLWIND.id} icon/> if <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon/> or <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon/> are available.</Wrapper>)
        .icon(SPELLS.WHIRLWIND.icon)
        .actual(`${formatPercentage(actual)}% of Whirlwinds were used when Colossus Smash or Mortal Strike were available.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default WhirlwindAnalyzer;
