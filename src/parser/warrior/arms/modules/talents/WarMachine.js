import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Your auto attacks generate 10% more Rage.
 *
 * Killing an enemy instantly generates 10 Rage, and increases your movement speed by 30% for 8 sec.
 */

class WarMachine extends Analyzer {
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WAR_MACHINE_TALENT_BUFF.id) / this.owner.fightDuration;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WAR_MACHINE_TALENT_ARMS.id);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.WAR_MACHINE_TALENT_ARMS.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default WarMachine;
