import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import React from 'react';

import RipUptime from '../bleeds/RipUptime';
import RakeUptime from '../bleeds/RakeUptime';
import MoonfireUptime from '../talents/MoonfireUptime';

/**
 * Wide statistics box for tracking the most important Feral DoT uptimes
 */
class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    ripUptime: RipUptime,
    rakeUptime: RakeUptime,
    moonfireUptime: MoonfireUptime,
    // TODO Savage Roar?
    // TODO Adaptive Swarm?
  };

  protected ripUptime!: RipUptime;
  protected rakeUptime!: RakeUptime;
  protected moonfireUptime!: MoonfireUptime;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.ripUptime.subStatistic()}
        {this.rakeUptime.subStatistic()}
        {this.moonfireUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
