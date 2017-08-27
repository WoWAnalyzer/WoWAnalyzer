import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ElementalBlast extends Module {

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
  }

  get hasteUptime() {
    return this.owner.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) / this.owner.fightDuration;
  }

  get critUptime() {
    return this.owner.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) / this.owner.fightDuration;
  }

  get masteryUptime() {
    return this.owner.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) / this.owner.fightDuration;
  }

  get elementalBlastUptime() {
    return this.hasteUptime + this.critUptime + this.masteryUptime;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ELEMENTAL_BLAST.id} />}
        value={`${formatPercentage(this.elementalBlastUptime)} %`}
        label={(
          <dfn data-tip={`With <b class="stat-mastery">${formatPercentage(this.masteryUptime)}% Mastery</b>, <b class="stat-criticalstrike">${formatPercentage(this.critUptime)}% Crit</b>, <b  class="stat-haste">${formatPercentage(this.hasteUptime)}% Haste</b> Uptime`}>
            Uptime
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ElementalBlast;
