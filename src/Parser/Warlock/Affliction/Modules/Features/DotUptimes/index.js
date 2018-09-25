import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticsListBox';

import AgonyUptime from './AgonyUptime';
import CorruptionUptime from './CorruptionUptime';
import UnstableAfflictionUptime from './UnstableAfflictionUptime';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
  };

  statistic() {
    return (
      <StatisticsListBox
        position={STATISTIC_ORDER.CORE(3)}
        title="DoT uptimes">
        {this.agonyUptime.subStatistic()}
        {this.corruptionUptime.subStatistic()}
        {this.unstableAfflictionUptime.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default DotUptimeStatisticBox;
