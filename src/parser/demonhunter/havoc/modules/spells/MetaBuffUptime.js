import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

/*
example report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV/#fight=48&source=10
* */

class MetaBuffUptime extends Analyzer {

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id) / this.owner.fightDuration;
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id);
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
