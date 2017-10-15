import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

class ChannelDemonfire extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} />}
        value={`${formatNumber(this.damage / this.owner.fightDuration * 1000)} DPS`}
        label="Damage done"
        tooltip={`Your Channel Demonfire did ${formatNumber(this.damage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default ChannelDemonfire;
