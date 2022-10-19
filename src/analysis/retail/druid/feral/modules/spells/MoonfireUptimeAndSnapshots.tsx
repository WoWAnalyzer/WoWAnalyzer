import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import Snapshots, {
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import {
  getMoonfireDuration,
  SNAPSHOT_DOWNGRADE_BUFFER,
} from 'analysis/retail/druid/feral/constants';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { proccedBloodtalons } from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class MoonfireUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  castLog: MfCast[] = [];

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
    const cast = getHardcast(application);
    if (!cast) {
      return; // no handling needed for 'uncontrolled' MFs from Convoke
    }

    // log the cast
    const timestamp = cast.timestamp;
    const targetName = this.enemies.getEntity(cast)?.name;
    const proccedBt = proccedBloodtalons(cast);
    const snapshotNames = snapshots.map((ss) => ss.name);
    const prevSnapshotNames = prevSnapshots === null ? null : prevSnapshots.map((ss) => ss.name);
    const wasUnacceptableDowngrade =
      prevPower > power && remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER;
    const wasUpgrade = prevPower < power;
    this.castLog.push({
      timestamp,
      targetName,
      proccedBt,
      remainingOnPrev,
      clipped,
      snapshotNames,
      prevSnapshotNames,
      wasUnacceptableDowngrade,
      wasUpgrade,
    });
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_FERAL.id);
  }

  /** Subsection explaining the use of Lunar Inspiration and providing performance statistics */
  get guideSubsection(): JSX.Element {
    // TODO this is basically copy pasta'd from Rake - can they be unified?
    const castPerfBoxes = this.castLog.map((cast) => {
      let value: QualitativePerformance = 'good';
      if (!cast.proccedBt) {
        if (cast.wasUnacceptableDowngrade) {
          value = 'fail';
        }
        if (cast.clipped > 0) {
          value = cast.wasUpgrade ? 'ok' : 'fail';
        }
      }

      const tooltip = (
        <>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
          <strong>{cast.targetName || 'unknown'}</strong>
          <br />
          {cast.proccedBt && (
            <>
              Used to proc{' '}
              <strong>
                <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />
              </strong>
              <br />
            </>
          )}
          {cast.prevSnapshotNames !== null && (
            <>
              Refreshed on target w/ {(cast.remainingOnPrev / 1000).toFixed(1)}s remaining{' '}
              {cast.clipped > 0 && (
                <>
                  <strong>- Clipped {(cast.clipped / 1000).toFixed(1)}s!</strong>
                </>
              )}
              <br />
            </>
          )}
          Snapshots:{' '}
          <strong>
            {cast.snapshotNames.length === 0 ? 'NONE' : cast.snapshotNames.join(', ')}
          </strong>
          <br />
          {cast.prevSnapshotNames !== null && (
            <>
              Prev Snapshots:{' '}
              <strong>
                {cast.prevSnapshotNames.length === 0 ? 'NONE' : cast.prevSnapshotNames.join(', ')}
              </strong>
            </>
          )}
        </>
      );
      return {
        value,
        tooltip,
      };
    });
    const hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
    return (
      <SubSection>
        <p>
          <b>
            <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />
          </b>{' '}
          (with <SpellLink id={TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id} />) is another builder DoT
          that behaves like a long-range (but weaker) Rake. For usage advice, see the Rake section.
        </p>
        <strong>Moonfire uptime / snapshots</strong>
        <small> - Try to get as close to 100% as the encounter allows!</small>
        {this.subStatistic()}
        <strong>Moonfire casts</strong>
        <small>
          {' '}
          - Green is a good cast{' '}
          {hasBt && (
            <>
              (or a cast with problems that procced{' '}
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />)
            </>
          )}
          , Yellow is an ok cast (clipped duration but upgraded snapshot), Red is a bad cast
          (clipped duration or downgraded snapshot w/ &gt;2s remaining). Mouseover for more details.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
      </SubSection>
    );
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

/** Tracking object for each MF cast */
type MfCast = {
  /** Cast's timestamp */
  timestamp: number;
  /** Name of cast's target */
  targetName?: string;
  /** If the cast was involved in proccing Bloodtalons */
  proccedBt: boolean;
  /** Time remaining on previous Rake */
  remainingOnPrev: number;
  /** Time clipped from previous Rake */
  clipped: number;
  /** Name of snapshots on new cast */
  snapshotNames: string[];
  /** Name of snapshots on prev cast (or null for fresh application) */
  prevSnapshotNames: string[] | null;
  /** True iff snapshots were downgraded with more than buffer time remaining */
  wasUnacceptableDowngrade: boolean;
  /** True iff the snapshot got stronger */
  wasUpgrade: boolean;
};

export default MoonfireUptimeAndSnapshots;
