import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from "../../../../common/SpellLink";

class CorruptionUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const corruptionUptime = this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
    if (this.owner.selectedCombatant.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id)) {
      when(corruptionUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your Corruption uptime can be improved. Try to pay more attention to your Corruption on the boss, which is especially important with the <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id}>T20 2-piece set bonus</SpellLink>.</span>)
            .icon(SPELLS.CORRUPTION_CAST.icon)
            .actual(`${formatPercentage(actual)}% Corruption uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
    }
    else {
      when(corruptionUptime).isLessThan(0.85)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Corruption uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.')
            .icon(SPELLS.CORRUPTION_CAST.icon)
            .actual(`${formatPercentage(actual)}% Corruption uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
    }
  }

  statistic() {
    const corruptionUptime = this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CORRUPTION_CAST.id} />}
        value={`${formatPercentage(corruptionUptime)} %`}
        label='Corruption uptime'
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default CorruptionUptime;
