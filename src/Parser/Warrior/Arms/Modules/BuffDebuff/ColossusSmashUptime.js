import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ColossusSmashUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const colossusSmashUptime = this.enemies.getBuffUptime(SPELLS.COLOSSUS_SMASH_DEBUFF.id) / this.owner.fightDuration;

    when(colossusSmashUptime).isLessThan(0.5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.COLOSSUS_SMASH_DEBUFF.id} /> uptime can be improved. Try to pay more attention to your debuff on the Boss since it increases your dealt damage by 15% + Mastery.</span>)
          .icon(SPELLS.COLOSSUS_SMASH_DEBUFF.icon)
          .actual(`${formatPercentage(actual)}% Colossus Smash uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.1);
      });
  }

  statistic() {
    const colossusSmashUptime = this.enemies.getBuffUptime(SPELLS.COLOSSUS_SMASH_DEBUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.COLOSSUS_SMASH_DEBUFF.id} />}
        value={`${formatPercentage(colossusSmashUptime)} %`}
        label="Colossus Smash uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default ColossusSmashUptime;
