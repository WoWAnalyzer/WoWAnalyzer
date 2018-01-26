import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import SoulShardTracker from '../../SoulShards/SoulShardTracker';

const CHAOS_BOLT_COST = 20;

class FeretoryOfSouls extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
  };

  _totalCasts = 0;
  _totalDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.FERETORY_OF_SOULS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._totalCasts += 1;
      this._totalDamage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    // if we haven't cast any Chaos Bolts, _totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this._totalDamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this._totalDamage / (this._totalCasts > 0 ? this._totalCasts : 1);
    const fragmentsGained = this.soulShardTracker.generatedAndWasted[SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.name].generated;
    const estimatedChaosBoltDamage = Math.floor(fragmentsGained / CHAOS_BOLT_COST) * avgDamage;
    return {
      item: ITEMS.FERETORY_OF_SOULS,
      result: (
        <dfn data-tip={`Estimated bonus damage - ${formatNumber(estimatedChaosBoltDamage)} damage - ${this.owner.formatItemDamageDone(estimatedChaosBoltDamage)} <br />This result is estimated by multiplying number of Soul Shard Fragments gained from this item, divided by 20 and floored down (because Chaos Bolt consumes 20 Soul Shard Fragments) by the average Chaos Bolt damage for the whole fight.`}>
          {fragmentsGained} Soul Shard Fragments gained
        </dfn>
      ),
    };
  }
}
export default FeretoryOfSouls;
