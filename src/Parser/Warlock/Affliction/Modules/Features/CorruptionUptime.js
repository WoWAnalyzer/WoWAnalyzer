import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class CorruptionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
  }

  get defaultSuggestionThresholds() {
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

  get t20SuggestionThresholds() {
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
    if (this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id)) {
      when(this.t20SuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime can be improved. Try to pay more attention to your Corruption on the boss, which is especially important with the <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id}>T20 2-piece set bonus</SpellLink>.</Wrapper>)
            .icon(SPELLS.CORRUPTION_CAST.icon)
            .actual(`${formatPercentage(actual)}% Corruption uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
    } else {
      when(this.defaultSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.</Wrapper>)
            .icon(SPELLS.CORRUPTION_CAST.icon)
            .actual(`${formatPercentage(actual)}% Corruption uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CORRUPTION_CAST.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Corruption uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default CorruptionUptime;
