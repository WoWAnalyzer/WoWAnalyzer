import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SiphonLifeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE_TALENT.id) / this.owner.fightDuration,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Siphon Life uptime can be improved. Try to pay more attention to your Siphon Life on the boss, perhaps use some debuff tracker.')
          .icon(SPELLS.SIPHON_LIFE_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Siphon Life uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const siphonLifeUptime = this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE_TALENT.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIPHON_LIFE_TALENT.id} />}
        value={`${formatPercentage(siphonLifeUptime)} %`}
        label="Siphon Life uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SiphonLifeUptime;
