import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

// Lord of Flames is a trait that makes your Summon Infernal summon 3 additional infernals which makes it a higher priority summon, but it can be used only every 10 minutes
// So first cast is LoF, and next LoF can be after 10 more minutes, that means that with 3 minute base cooldown, we can cast another LoF after 12 minutes
// making Summon Infernal basically a 12 minute CD (because without the buff it's worse than Doomguard)
const LORD_OF_FLAMES_COOLDOWN = 180 * 4;

class UnusedLordOfFlames extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  get suggestionThresholds() {
    const maxCasts = Math.ceil(calculateMaxCasts(LORD_OF_FLAMES_COOLDOWN, this.owner.fightDuration));
    const casts = this.abilityTracker.getAbility(SPELLS.SUMMON_INFERNAL_UNTALENTED.id).casts || 0;

    return {
      actual: casts,
      isLessThan: maxCasts,
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You should cast <SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} /> when you don't have Lord of Flames debuff, as it is a more powerful cooldown than <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} />, even on single target. Try to pair up the cooldown with Bloodlust haste buffs (<SpellLink id={SPELLS.BLOODLUST.id} />, <SpellLink id={SPELLS.HEROISM.id} />, <SpellLink id={SPELLS.TIME_WARP.id} /> etc.).</React.Fragment>)
          .icon(SPELLS.SUMMON_INFERNAL_UNTALENTED.icon)
          .actual(`${actual} out of ${recommended} buffed Summon Infernals.`)
          .recommended(`${recommended} is recommended`);
      });
  }
}

export default UnusedLordOfFlames;
