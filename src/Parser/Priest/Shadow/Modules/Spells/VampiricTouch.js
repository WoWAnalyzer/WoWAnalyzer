import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

class VampiricTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
        isLessThan: {
            minor,
            average,
            major,
    }} = this.suggestionThresholds;

    when(this.uptime).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> on the boss.</span>)
          .icon(SPELLS.VAMPIRIC_TOUCH.icon)
          .actual(`${formatPercentage(actual)}% Vampiric Touch uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (<SmallStatisticBox
      icon={<SpellIcon id={SPELLS.VAMPIRIC_TOUCH.id} />}
      value={`${formatPercentage(this.uptime)} %`}
      label="Vampiric Touch uptime"
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default VampiricTouch;
