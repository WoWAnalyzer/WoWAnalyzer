import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

// Lord of Flames is a trait that makes your Summon Infernal summon 3 additional infernals which makes it a higher priority summon, but it can be used only every 10 minutes
// So first cast is LoF, and next LoF can be after 10 more minutes, that means that with 3 minute base cooldown, we can cast another LoF after 12 minutes
// making Summon Infernal basically a 12 minute CD (because without the buff it's worse than Doomguard)
const LORD_OF_FLAMES_COOLDOWN = 180 * 4;

class UnusedLordOfFlames extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  suggestions(when) {
    const maxLordOfFlamesCasts = calculateMaxCasts(LORD_OF_FLAMES_COOLDOWN, this.owner.fightDuration);
    const infernalCasts = this.abilityTracker.getAbility(SPELLS.SUMMON_INFERNAL_UNTALENTED.id).casts;
    const percentage = infernalCasts / maxLordOfFlamesCasts;
    when(percentage).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should cast <SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} /> when you don't have Lord of Flames debuff, as it is a more powerful cooldown than <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} />, even on single target. Try to pair up the cooldown with Bloodlust haste buffs (Bloodlust, Heroism, Time Warp etc.).</span>)
          .icon(SPELLS.SUMMON_INFERNAL_UNTALENTED.icon)
          .actual(`${infernalCasts} out of ${maxLordOfFlamesCasts} buffed Summon Infernals.`)
          .recommended(`${maxLordOfFlamesCasts} is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.1);
      });
    // the thresholds don't even make sense here, percentage will be either 0 (no cast), 0.5 (1 out of 2) or 1 most likely (2 out of 2 or 1 out of 1), but both of the first two are already major issues
  }
}

export default UnusedLordOfFlames;
