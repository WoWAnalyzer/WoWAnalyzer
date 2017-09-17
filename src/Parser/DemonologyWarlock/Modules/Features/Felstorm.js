import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const FELSTORM_COOLDOWN = 45;

class Felstorm extends Module {

  mainPetFelstormCount = 0;

  // works with either direct /cast Felstorm or by using the Command Demon ability (if direct /cast Felstorm, then the player didn't cast it, but this buff gets applied either way)
  on_toPlayerPet_applybuff(event) {
    if (event.ability.guid !== SPELLS.FELSTORM_BUFF.id) {
      return;
    }
    if (!event.sourceInstance) {
      // permanent Felguard doesn't have sourceInstance, while Grimoire: Felguard does (both use Felstorm in the exact same way)
      this.mainPetFelstormCount += 1;
    }
  }

  suggestions(when) {
    const maxCasts = Math.ceil(calculateMaxCasts(FELSTORM_COOLDOWN, this.owner.fightDuration));
    const percentage = this.mainPetFelstormCount / maxCasts;
    when(percentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should use your Felguard's <SpellLink id={SPELLS.FELSTORM.id}/> more often, preferably on cooldown.</span>)
          .icon(SPELLS.FELSTORM.icon)
          .actual(`${this.mainPetFelstormCount} out of ${maxCasts} (${formatPercentage(actual)} %) Felstorm casts.`)
          .recommended(`> ${formatPercentage(recommended)} % is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }
}

export default Felstorm;
