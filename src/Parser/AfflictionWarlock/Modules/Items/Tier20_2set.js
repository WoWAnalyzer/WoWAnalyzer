import React from 'react';
import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';
import SoulShardTracker from '../SoulShards/SoulShardTracker';

class Tier20_2set extends Module {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  totalTicks = 0;
  totalDamage = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id);
    }
  }

  on_byPlayer_damage(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.some(id => event.ability.guid === id)) {
      this.totalTicks++;
      this.totalDamage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    // if we haven't cast any UAs, totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this.totalDamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this.totalDamage / (this.totalTicks > 0 ? this.totalTicks : 1);
    const TICKS_PER_UA = 4;
    const shardsGained = this.soulShardTracker.gained[SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id].shards;
    const estimatedUAdamage = shardsGained * TICKS_PER_UA * avgDamage;
    return {
      id: `spell-${SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id} />,
      result: (
        <dfn data-tip={`${formatNumber(estimatedUAdamage)} damage - ${this.owner.formatItemDamageDone(estimatedUAdamage)} <br />This result is estimated by multiplying number of Soul Shards gained from this item by the average Unstable Affliction damage for the whole fight.`}>
          {`${shardsGained} Soul Shards gained`}
        </dfn>
      ),
    };

  }
}
export default Tier20_2set;
