import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class SiphonLifeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE_TALENT.id) / this.owner.fightDuration;
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
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id} /> uptime can be improved. Try to pay more attention to your Siphon Life on the boss, perhaps use some debuff tracker.</React.Fragment>)
          .icon(SPELLS.SIPHON_LIFE_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Siphon Life uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id} /> uptime
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.uptime)} %
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIPHON_LIFE_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Siphon Life uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SiphonLifeUptime;
