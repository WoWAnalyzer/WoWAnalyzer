import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const frostfeverUptime = this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
    when(frostfeverUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id={SPELLS.FROST_FEVER.id} /> uptime can be improved. Try to pay attention to when Frost Fever is about to fall off the priority target, using <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to refresh Frost Fever. Using a debuff tracker can help.</span>)
            .icon(SPELLS.FROST_FEVER.icon)
            .actual(`${formatPercentage(actual)}% Frost Fever uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
  }

  statistic() {
    const frostfeverUptime = this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROST_FEVER.id} />}
        value={`${formatPercentage(frostfeverUptime)} %`}
        label="Frost Fever Uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default FrostFeverUptime;
