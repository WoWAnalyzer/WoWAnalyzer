import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

/**
 * TODO: 
 * - Lightning Rod damage
 * - Number of enemys with debuff
 */
class LightningRod extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.LIGHTNING_ROD_TALENT.id);
  }

  get rawUpdate() {
    return this.enemies.getBuffUptime(SPELLS.LIGHTNING_ROD_DEBUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHTNING_ROD_TALENT.id} />}
        value={`${formatPercentage(this.rawUpdate)} %`}
        label={'Uptime'}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default LightningRod;
