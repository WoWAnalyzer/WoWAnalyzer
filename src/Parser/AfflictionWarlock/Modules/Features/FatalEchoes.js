import React from 'react';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

class FatalEchoes extends Module {
  playerCasts = 0;
  uasApplied = 0;

  totalTicks = 0;
  totalDamage = 0;

  on_byPlayer_damage(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.some(id => event.ability.guid === id)) {
      this.totalTicks++;
      this.totalDamage += event.amount + (event.absorbed || 0);
    }
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.UNSTABLE_AFFLICTION_CAST.id) {
      this.playerCasts++;
    }
  }

  on_byPlayer_applydebuff(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.some(id => event.ability.guid === id)) {
      this.uasApplied++;
    }
  }

  statistic() {
    const totalProcs = this.uasApplied - this.playerCasts;
    const avgDamage = this.totalDamage / (this.totalTicks > 0 ? this.totalTicks : 1);
    const TICKS_PER_UA = 4;
    const estimatedUAdamage = totalProcs * TICKS_PER_UA * avgDamage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FATAL_ECHOES.id}/>}
        value={`${totalProcs}`}
        label='Fatal Echoes procs'
        tooltip={`${formatNumber(estimatedUAdamage)} damage - ${this.owner.formatItemDamageDone(estimatedUAdamage)} <br />This result is estimated by multiplying number of free Unstable Afflictions from the trait by the average Unstable Affliction damage for the whole fight.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default FatalEchoes;
