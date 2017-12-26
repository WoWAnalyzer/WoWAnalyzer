import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class CorruptionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  get suggestionThresholds() {
    const corruptionUptime = this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
    if (this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id)) {
      return {
        actual: corruptionUptime,
        isLessThan: {
          minor: 0.95,
          average: 0.9,
          major: 0.8,
        },
        style: 'percentage',
        text: <Wrapper>Your Corruption uptime can be improved. Try to pay more attention to your Corruption on the boss, which is especially important with the <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id}>T20 2-piece set bonus</SpellLink>.</Wrapper>,
      };
    } else {
      return {
        actual: corruptionUptime,
        isLessThan: {
          minor: 0.85,
          average: 0.8,
          major: 0.7,
        },
        style: 'percentage',
        text: 'Your Corruption uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.',
      };
    }
  }

  suggestions(when) {
    const suggestions = this.suggestionThresholds;
    when(suggestions)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(suggestions.text)
          .icon(SPELLS.CORRUPTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% Corruption uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const corruptionUptime = this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CORRUPTION_CAST.id} />}
        value={`${formatPercentage(corruptionUptime)} %`}
        label="Corruption uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default CorruptionUptime;
