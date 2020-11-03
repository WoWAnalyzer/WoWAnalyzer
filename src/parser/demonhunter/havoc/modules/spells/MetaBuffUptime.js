import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';

import { formatPercentage, formatDuration } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';

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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`The Metamorphosis buff total uptime was ${formatDuration(this.buffDuration / 1000)}.`}
      >
        <BoringSpellValueText spell={SPELLS.METAMORPHOSIS_HAVOC_BUFF}>
          <>
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MetaBuffUptime;
