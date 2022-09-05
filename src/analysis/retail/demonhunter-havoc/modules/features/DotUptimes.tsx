import COVENANTS from 'game/shadowlands/COVENANTS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import SinfulBrandUptime from '../covenants/SinfulBrandUptime';

/**
 * Wide statistics box for tracking the most important Havoc DH DoT uptimes
 */
class DotUptimes extends Analyzer {
  static dependencies = {
    sinfulBrandUptime: SinfulBrandUptime,
  };

  protected sinfulBrandUptime!: SinfulBrandUptime;

  constructor(options: Options) {
    super(options);
    // this should change if something is added that isn't Sinful Brand
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
  }

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> DoT Uptimes
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>These uptime bars show the times your DoT was active on at least one target.</>}
      >
        {this.sinfulBrandUptime.active && this.sinfulBrandUptime.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default DotUptimes;
