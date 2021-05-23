import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import React from 'react';

import RakeUptime from '../bleeds/RakeUptime';
import RipUptime from '../bleeds/RipUptime';
import AdaptiveSwarmFeral from '../shadowlands/AdaptiveSwarmFeral';
import MoonfireUptime from '../talents/MoonfireUptime';

/**
 * Wide statistics box for tracking the most important Feral DoT uptimes
 */
class DotUptimesAndSnapshots extends Analyzer {
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

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={
          <>
            These uptime bars show the times your DoT was active on at least one target. The
            snapshot percent is the percentage of the DoT's uptime the snapshot was active on at
            least one target (not the percent of the whole fight).
          </>
        }
      >
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

export default DotUptimesAndSnapshots;
