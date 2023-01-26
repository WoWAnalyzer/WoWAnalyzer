import Analyzer from 'parser/core/Analyzer';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';
import UptimeIcon from 'interface/icons/Uptime';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import TALENTS from 'common/TALENTS/rogue';

import GarroteUptimeAndSnapshots from '../spells/GarroteUptimeAndSnapshots';
import RuptureUptimeAndSnapshots from '../spells/RuptureUptimeAndSnapshots';
import CrimsonTempestUptimeAndSnapshots from '../talents/CrimsonTempestUptimeAndSnapshots';

export default class DotUptimesAndSnapshots extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    crimsonTempestUptimeAndSnapshots: CrimsonTempestUptimeAndSnapshots,
    garroteUptimeAndSnapshots: GarroteUptimeAndSnapshots,
    ruptureUptimeAndSnapshots: RuptureUptimeAndSnapshots,
  };

  protected crimsonTempestUptimeAndSnapshots!: CrimsonTempestUptimeAndSnapshots;
  protected garroteUptimeAndSnapshots!: GarroteUptimeAndSnapshots;
  protected ruptureUptimeAndSnapshots!: RuptureUptimeAndSnapshots;

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
        {this.garroteUptimeAndSnapshots.subStatistic()}
        {this.ruptureUptimeAndSnapshots.subStatistic()}
        {this.selectedCombatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT) &&
          this.crimsonTempestUptimeAndSnapshots.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}
