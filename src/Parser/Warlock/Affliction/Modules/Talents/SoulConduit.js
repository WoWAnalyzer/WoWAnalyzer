import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';
import SoulShardTracker from '../SoulShards/SoulShardTracker';

const TICKS_PER_UA = 4;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
  };

  _totalTicks = 0;
  _totalUAdamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this._totalTicks += 1;
      this._totalUAdamage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    // if we haven't cast any UAs, _totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this._totalUAdamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this._totalUAdamage / (this._totalTicks > 0 ? this._totalTicks : 1);
    const shardsGained = this.soulShardTracker.generatedAndWasted[SPELLS.SOUL_CONDUIT_SHARD_GEN.id].generated;
    const estimatedUAdamage = shardsGained * TICKS_PER_UA * avgDamage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_CONDUIT_TALENT.id} />}
        value={shardsGained}
        label="Soul Shards gained"
        tooltip={`Estimated damage: ${formatNumber(estimatedUAdamage)} - ${this.owner.formatItemDamageDone(estimatedUAdamage)} <br />This result is estimated by multiplying number of Soul Shards gained from this talent by the average Unstable Affliction damage for the whole fight.`}
      />
    );
  }
}

export default SoulConduit;
