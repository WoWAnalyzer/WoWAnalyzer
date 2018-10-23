import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';

import DeepWoundsUptime from './DeepWoundsUptime';
import RendUptime from './RendUptime';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    deepwoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
  };

  statistic() {
    return (
      <StatisticsListBox
        position={STATISTIC_ORDER.CORE(3)}
        title="DoT uptimes">
        {this.deepwoundsUptime.subStatistic()}
        {this.rendUptime.active && this.rendUptime.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default DotUptimeStatisticBox;
