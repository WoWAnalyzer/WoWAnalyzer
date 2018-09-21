import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';

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
      <StatisticsListBox title="DoT uptimes">
        {this.agonyUptime.subStatistic()}
        {this.corruptionUptime.subStatistic()}
        {this.unstableAfflictionUptime.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default DotUptimeStatisticBox;
