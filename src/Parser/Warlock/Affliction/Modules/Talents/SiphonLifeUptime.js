import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

class SiphonLifeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
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
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id} /> uptime can be improved. Try to pay more attention to your Siphon Life on the boss, perhaps use some debuff tracker.</Wrapper>)
          .icon(SPELLS.SIPHON_LIFE_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Siphon Life uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIPHON_LIFE_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Siphon Life uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SiphonLifeUptime;
