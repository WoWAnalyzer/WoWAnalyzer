import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class RipUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RIP.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your <SpellLink id={SPELLS.RIP.id} /> uptime can be improved. You can refresh the DoT once it has reached its <dfn data-tip={`The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn>, don't wait for it to wear off.
          {!this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id) ?
            <> Avoid spending combo points on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if <SpellLink id={SPELLS.RIP.id} /> will need refreshing soon.</> : <></>
          }
        </>
      )
        .icon(SPELLS.RIP.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIP.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Rip uptime"
        position={STATISTIC_ORDER.CORE(4)}
      />
    );
  }
}

export default RipUptime;
