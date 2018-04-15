import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellUsable from '../Features/SpellUsable';

class SlamAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  slams = 0;
  wastedSlams = 0;

  on_byPlayer_cast(event) {
    if(SPELLS.SLAM.id !== event.ability.guid) {
      return;
    }

    this.slams += 1;

    if(this.combatants.selected.hasTalent(SPELLS.FERVOR_OF_BATTLE_TALENT.id)) {
      // If Fervor of Battle is talented stop here because every slam is going to be flagged as bad.
      return;
    }

    const weightedBlades3Stacks = this.combatants.selected.hasBuff(SPELLS.WEIGHTED_BLADES.id) && this.combatants.selected.getBuff(SPELLS.WEIGHTED_BLADES.id).stacks === 3;

    if(!this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id) && this.spellUsable.isAvailable(SPELLS.COLOSSUS_SMASH.id)) {
      // If slam was used when colossus smash could have been used to apply shattered defenses, flag it.
      this.wastedSlams += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Slam was used without Shattered Defenses while Colossus Smash was available.';
    } else if(this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id) && !weightedBlades3Stacks) {
      // If the player used slam when they could have used mortal strike, flag it, unless 3 stacks of weighted blades were active.
      this.wastedSlams += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Slam was used while Mortal Strike was available.';
    }
  }

  get wastedSlamThresholds() {
    return {
			actual: this.wastedSlams / this.slams,
			isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
			style: 'percentage',
		};
  }
  get fervoredSlamThresholds() {
    return {
			actual: this.slams,
			isGreaterThan: {
        major: 0,
      },
			style: 'number',
		};
  }

  suggestions(when) {
    when(this.wastedSlamThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try to avoid using <SpellLink id={SPELLS.SLAM.id} icon/> if <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon/> or <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon/> are available.</Wrapper>)
        .icon(SPELLS.SLAM.icon)
        .actual(`${formatPercentage(actual)}% of Slams were used when Colossus Smash or Mortal Strike were available.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });

    if(this.combatants.selected.hasTalent(SPELLS.FERVOR_OF_BATTLE_TALENT.id)) {
      when(this.fervoredSlamThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should never use <SpellLink id={SPELLS.SLAM.id} icon/> when <SpellLink id={SPELLS.FERVOR_OF_BATTLE_TALENT.id} icon/> is talented.</Wrapper>)
          .icon(SPELLS.SLAM.icon)
          .actual(`Slam was used ${formatNumber(actual)} times.`)
          .recommended(`${formatNumber(recommended)}% is recommended`);
      });
    }
  }
}

export default SlamAnalyzer;
