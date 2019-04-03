import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

/*
example report: https://www.warcraftlogs.com/reports/KGJgZPxanBX82LzV/#fight=4&source=20
* */

class MetaBuffUptime extends Analyzer {

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id) / this.owner.fightDuration;
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id);
  }

  get suggestionThresholds() {
    return {
      actual: 100,
      isGreaterThan: {
        minor: 10,
        average: 10,
        major: 10,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> Scream over discord "What have YOU sacrifice!!" for a 10% DPS increase.</>)
          .icon(SPELLS.METAMORPHOSIS_HAVOC_BUFF.icon)
          .actual(`${formatPercentage(actual)}% condensending screaming done`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<SpellIcon id={SPELLS.METAMORPHOSIS_HAVOC_BUFF.id} />}
        value={`${formatPercentage(this.buffUptime)}%`}
        label="Metamorphosis Uptime"
        tooltip={`The Metamorphosis buff total uptime was ${formatDuration(this.buffDuration / 1000)}.`}
      />
    );
  }
}

export default MetaBuffUptime;
