import React from 'react';

import CoreDeathTracker from 'Parser/Core/Modules/DeathTracker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

class DeathTracker extends CoreDeathTracker {

  suggestions(when) {
    const timeDeadSeconds = this.timeDead / 1000;
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDeathSuggestion) {
      when(this.timeDead).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You died during this fight and were dead for {formatNumber(timeDeadSeconds)} seconds. Make sure you are paying attention to mechanics and dodging avoidable damage. You can also use defensive spells like <SpellLink id={SPELLS.BLAZING_BARRIER.id}/> or <SpellLink id={SPELLS.ICE_BLOCK.id}/> to avoid taking unavoidable damage. Additionally, ensure you are using Health Potions and Healthstones to heal yourself when you are very low.</span>)
            .icon('ability_fiegndead')
            .actual(`${formatNumber(timeDeadSeconds)} seconds dead`)
            .recommended(`${formatNumber(recommended)} is recommended`)
            .major(1);
        });
      }
  }
}

export default DeathTracker;
