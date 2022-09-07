import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import RakeUptimeAndSnapshots from '../bleeds/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from '../bleeds/RipUptimeAndSnapshots';
import AdaptiveSwarmFeral from '../shadowlands/AdaptiveSwarmFeral';
import MoonfireUptimeAndSnapshots from '../talents/MoonfireUptimeAndSnapshots';

/**
 * Wide statistics box for tracking the most important Feral DoT uptimes
 */
class DotUptimesAndSnapshots extends Analyzer {
  static dependencies = {
    ripUptime: RipUptimeAndSnapshots,
    rakeUptime: RakeUptimeAndSnapshots,
    moonfireUptime: MoonfireUptimeAndSnapshots,
    adaptiveSwarm: AdaptiveSwarmFeral,
  };

  protected ripUptime!: RipUptimeAndSnapshots;
  protected rakeUptime!: RakeUptimeAndSnapshots;
  protected moonfireUptime!: MoonfireUptimeAndSnapshots;
  protected adaptiveSwarm!: AdaptiveSwarmFeral;

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> DoT Uptimes and Snapshots
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={
          <>
            These uptime bars show the times your DoT was active on at least one target. The
            snapshot percent is the percentage of the DoT's uptime the snapshot was active on at
            least one target (not the percent of the whole fight).
          </>
        }
      >
        {this.ripUptime.subStatistic()}
        {this.rakeUptime.subStatistic()}
        {this.moonfireUptime.active && this.moonfireUptime.subStatistic()}
        {this.adaptiveSwarm.active && this.adaptiveSwarm.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default DotUptimesAndSnapshots;
