import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../../Constants';
import SoulShardTracker from '../../SoulShards/SoulShardTracker';

const TICKS_PER_UA = 4;

class PowerCordOfLethtendris extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
  };

  _totalTicks = 0;
  _totalUAdamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.POWER_CORD_OF_LETHTENDRIS.id);
  }

  on_byPlayer_damage(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this._totalTicks += 1;
      this._totalUAdamage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    // if we haven't cast any UAs, _totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this._totalUAdamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this._totalUAdamage / (this._totalTicks > 0 ? this._totalTicks : 1);
    const shardsGained = (this.soulShardTracker.buildersObj[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id] && this.soulShardTracker.buildersObj[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id].generated) || 0;
    const estimatedUAdamage = shardsGained * TICKS_PER_UA * avgDamage;
    return {
      item: ITEMS.POWER_CORD_OF_LETHTENDRIS,
      result: (
        <dfn data-tip={`${formatNumber(estimatedUAdamage)} damage - ${this.owner.formatItemDamageDone(estimatedUAdamage)} <br />This result is estimated by multiplying number of Soul Shards gained from this item by the average Unstable Affliction damage for the whole fight.`}>
          {shardsGained} Soul Shards gained
        </dfn>
      ),
    };
  }
}

export default PowerCordOfLethtendris;
