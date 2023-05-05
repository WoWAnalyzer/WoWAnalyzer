import Snapshots, {
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import Enemies from 'parser/shared/modules/Enemies';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { getThrashFeralDuration } from 'analysis/retail/druid/feral/constants';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';

class ThrashUptimeAndSnapshot extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.THRASH_FERAL, SPELLS.THRASH_FERAL_BLEED, [TIGERS_FURY_SPEC], options);
  }

  getDotExpectedDuration(): number {
    return getThrashFeralDuration(this.selectedCombatant);
  }

  getDotFullDuration(): number {
    return getThrashFeralDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.THRASH_FERAL_BLEED.id);
  }

  handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: SnapshotSpec[],
    prevSnapshots: SnapshotSpec[] | null,
    power: number,
    prevPower: number,
    remainingOnPrev: number,
    clipped: number,
  ) {
    // nothing to do yet..
  }
}

export default ThrashUptimeAndSnapshot;
