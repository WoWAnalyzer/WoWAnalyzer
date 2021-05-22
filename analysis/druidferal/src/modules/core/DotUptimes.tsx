import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import React from 'react';

import UptimeIcon from 'interface/icons/Uptime';
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
  };

  protected ripUptime!: RipUptime;
  protected rakeUptime!: RakeUptime;
  protected moonfireUptime!: MoonfireUptime;
  protected adaptiveSwarm!: AdaptiveSwarmFeral;

  // TODO more / better tooltips?
  statistic() {
    return (
      <Statistic wide size="flexible" position={STATISTIC_ORDER.CORE(1)} tooltip={
        <>
          These uptime bars show the times your DoT or snapshotted DoT were active on at
          least one target.
        </>
      }>
        <div className="pad">
          <div className="boring-value">
            <h3>
              <UptimeIcon /> DoT Uptimes and Snapshots
            </h3>
          </div>
          {this.ripUptime.subStatistic()}
          {this.rakeUptime.subStatistic()}
          {this.moonfireUptime.active && this.moonfireUptime.subStatistic()}
          {this.adaptiveSwarm.active && this.adaptiveSwarm.subStatistic()}
        </div>
      </Statistic>
    );
  }
}

export default DotUptimeStatisticBox;
