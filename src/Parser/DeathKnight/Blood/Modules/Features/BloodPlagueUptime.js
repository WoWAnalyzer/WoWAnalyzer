import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class BloodPlagueUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const bloodplagueUptime = this.enemies.getBuffUptime(SPELLS.BLOOD_PLAGUE.id) / this.owner.fightDuration;
    when(bloodplagueUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Blood Plague uptime can be improved. Perhaps use some debuff tracker.')
            .icon(SPELLS.BLOOD_PLAGUE.icon)
            .actual(`${formatPercentage(actual)}% Blood Plague uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
  }

  statistic() {
    const bloodplagueUptime = this.enemies.getBuffUptime(SPELLS.BLOOD_PLAGUE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLOOD_PLAGUE.id} />}
        value={`${formatPercentage(bloodplagueUptime)} %`}
        label="Blood Plague uptime"
        tooltip="Provides small amount of damage and healing. Auto attacks against an infected target can trigger Crimson Scourge."
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default BloodPlagueUptime;
