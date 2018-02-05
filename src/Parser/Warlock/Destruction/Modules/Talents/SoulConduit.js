import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import SoulShardTracker from '../SoulShards/SoulShardTracker';


// credit to feretory of souls module
class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
    };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
  }

  subStatistic() {
    const spent = this.soulShardTracker.fragmentsSpent / 10;
    const shardsGained = this.soulShardTracker.generatedAndWasted[SPELLS.SOUL_CONDUIT_TALENT.name].generated / 10;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id}>
            <SpellIcon id={SPELLS.SOUL_CONDUIT_TALENT.id} noLink /> Soul Shards Gained
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
        <dfn data-tip={`Your Soul Conduit refunded ${formatPercentage(shardsGained/spent)} % of soul shards spent`}>
            {shardsGained}
          </dfn>
        </div>
      </div>
    );
  }
}

export default SoulConduit;
