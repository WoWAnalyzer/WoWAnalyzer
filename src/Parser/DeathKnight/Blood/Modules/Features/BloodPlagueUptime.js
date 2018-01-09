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

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BLOOD_PLAGUE.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.94,
        average: 0.84,
        major: .74,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Blood Plague uptime can be improved. Perhaps use some debuff tracker.')
            .icon(SPELLS.BLOOD_PLAGUE.icon)
            .actual(`${formatPercentage(actual)}% Blood Plague uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLOOD_PLAGUE.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Blood Plague uptime"
        tooltip="Provides small amount of damage and healing. Auto attacks against an infected target can trigger Crimson Scourge."
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default BloodPlagueUptime;
