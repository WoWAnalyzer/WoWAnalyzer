import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class SavageRoarUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SAVAGE_ROAR_TALENT.id) / this.owner.fightDuration;
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
          Your <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> uptime can be improved. You should refresh the buff once it has reached its <dfn data-tip={`The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn>, don't wait for it to wear off. Avoid spending combo points on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> will need refreshing soon.
        </>
      )
        .icon(SPELLS.SAVAGE_ROAR_TALENT.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SAVAGE_ROAR_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Savage Roar uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default SavageRoarUptime;
