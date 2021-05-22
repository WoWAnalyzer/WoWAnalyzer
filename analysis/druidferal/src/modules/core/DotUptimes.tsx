import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import React from 'react';

import RakeUptime from '../bleeds/RakeUptime';
import RipUptime from '../bleeds/RipUptime';
import AdaptiveSwarmFeral from '../shadowlands/AdaptiveSwarmFeral';
import MoonfireUptime from '../talents/MoonfireUptime';
import Statistic from 'parser/ui/Statistic';

/**
 * Wide statistics box for tracking the most important Feral DoT uptimes
 */
class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    ripUptime: RipUptime,
    rakeUptime: RakeUptime,
    moonfireUptime: MoonfireUptime,
    adaptiveSwarm: AdaptiveSwarmFeral,
    // TODO Savage Roar?
  };

  protected ripUptime!: RipUptime;
  protected rakeUptime!: RakeUptime;
  protected moonfireUptime!: MoonfireUptime;
  protected adaptiveSwarm!: AdaptiveSwarmFeral;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.ripUptime.subStatistic()}
        {this.rakeUptime.subStatistic()}
        {this.moonfireUptime.active && this.moonfireUptime.subStatistic()}
        {this.adaptiveSwarm.active && this.adaptiveSwarm.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
