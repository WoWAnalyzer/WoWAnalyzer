import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

class Shadowflame extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SHADOWFLAME_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SHADOWFLAME_TALENT.id) {
      return;
    }
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    const uptime = this.enemies.getBuffUptime(SPELLS.SHADOWFLAME_TALENT.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOWFLAME_TALENT.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Shadowflame uptime"
        tooltip={`Your Shadowflame did ${formatNumber(this.damage)} total damage (${this.owner.formatItemDamageDone(this.damage)}).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default Shadowflame;
