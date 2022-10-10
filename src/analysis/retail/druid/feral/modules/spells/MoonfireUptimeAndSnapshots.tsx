import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import Snapshots, {
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import { getMoonfireDuration } from 'analysis/retail/druid/feral/constants';

class MoonfireUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.MOONFIRE_FERAL, SPELLS.MOONFIRE_FERAL, [TIGERS_FURY_SPEC], options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id);
  }

  getDotExpectedDuration(): number {
    return getMoonfireDuration(this.selectedCombatant);
  }

  getDotFullDuration(): number {
    return getMoonfireDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id);
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
    // TODO track downgrades
    // TODO track non-upgrade clips
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_FERAL.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get tigersFurySnapshotThresholds() {
    // MF is often used for proccing BT, so harder to maintain snapshots
    const breakpoints = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT)
      ? { minor: 0.6, average: 0.45, major: 0.3 }
      : { minor: 0.85, average: 0.6, major: 0.4 };
    return {
      actual: this.percentWithTigerFury,
      isLessThan: breakpoints,
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.MOONFIRE_FERAL],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default MoonfireUptimeAndSnapshots;
