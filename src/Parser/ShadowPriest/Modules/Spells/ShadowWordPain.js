import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ShadowWordPain extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const shadowWordPainUptime = this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
    when(shadowWordPainUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`${formatPercentage(actual)}% Shadow Word: Pain uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const shadowWordPainUptime = this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
    return (<StatisticBox
      icon={<SpellIcon id={SPELLS.SHADOW_WORD_PAIN.id} />}
      value={`${formatPercentage(shadowWordPainUptime)} %`}
      label="Shadow Word: Pain uptime"
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default ShadowWordPain;
