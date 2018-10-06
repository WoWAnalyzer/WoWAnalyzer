import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class AgonyUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    let text;
    if (this.selectedCombatant.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id)) {
      text = <>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of Soul Shards. Try to pay more attention to your Agony on the boss, especially since you're using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id} /> talent.</>;
    } else {
      text = <>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of Soul Shards. Try to pay more attention to your Agony on the boss, perhaps use some debuff tracker.</>;
    }
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(text)
          .icon(SPELLS.AGONY.icon)
          .actual(`${formatPercentage(actual)}% Agony uptime`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.AGONY.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default AgonyUptime;
