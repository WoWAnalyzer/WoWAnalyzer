import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
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
        return suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`${formatPercentage(actual)}% Shadow Word: Pain uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (<SmallStatisticBox
      icon={<SpellIcon id={SPELLS.SHADOW_WORD_PAIN.id} />}
      value={`${formatPercentage(this.uptime)} %`}
      label="Shadow Word: Pain uptime"
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default ShadowWordPain;
