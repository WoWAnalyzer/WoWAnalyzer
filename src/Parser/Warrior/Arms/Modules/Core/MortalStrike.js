import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellUsable from '../Features/SpellUsable';

class MortalStrikeAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  mortalStrikes = 0;
  unshatteredMortalStrikes = 0;

  on_byPlayer_cast(event) {
    if(SPELLS.MORTAL_STRIKE.id !== event.ability.guid) {
      return;
    }

    this.mortalStrikes += 1;
    // If the player used mortal strike when shattered defenses was inactive and colossus smash was available increment the counter.
    // We don't check for Warbreaker here as it is often saved for AOE burst.
    if(!this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id) && this.spellUsable.isAvailable(SPELLS.COLOSSUS_SMASH.id)) {
      this.unshatteredMortalStrikes += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Mortal Strike was used without Shattered Defenses while Colossus Smash was available.';
    }
  }

  get unshatteredMortalStrikeThresholds() {
    return {
			actual: this.unshatteredMortalStrikes / this.mortalStrikes,
			isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
			style: 'percentage',
		};
  }

  suggestions(when) {
    when(this.unshatteredMortalStrikeThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try to avoid using <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon/> if <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon/> is inactive and <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon/> is available.</Wrapper>)
        .icon(SPELLS.MORTAL_STRIKE.icon)
        .actual(`${formatPercentage(actual)}% of Mortal Strikes were used without Shattered Defenses unnecessarily.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default MortalStrikeAnalyzer;
