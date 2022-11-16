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
import { SpellLink } from 'interface';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { proccedBloodtalons } from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

class MoonfireUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  castEntries: BoxRowEntry[] = [];

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
    const targetName = this.owner.getTargetName(cast);
    const proccedBt = proccedBloodtalons(cast);
    const snapshotNames = snapshots.map((ss) => ss.name);
    const prevSnapshotNames = prevSnapshots === null ? null : prevSnapshots.map((ss) => ss.name);
    const wasUnacceptableDowngrade =
      prevPower > power && remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER;
    const wasUpgrade = prevPower < power;

    let value: QualitativePerformance = QualitativePerformance.Good;
    if (!proccedBt) {
      if (wasUnacceptableDowngrade) {
        value = QualitativePerformance.Fail;
      }
      if (clipped > 0) {
        value = wasUpgrade ? QualitativePerformance.Ok : QualitativePerformance.Fail;
      }
    }

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
        {proccedBt && (
          <>
            Used to proc{' '}
            <strong>
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />
            </strong>
            <br />
          </>
        )}
        {prevSnapshotNames !== null && (
          <>
            Refreshed on target w/ {(remainingOnPrev / 1000).toFixed(1)}s remaining{' '}
            {clipped > 0 && (
              <>
                <strong>- Clipped {(clipped / 1000).toFixed(1)}s!</strong>
              </>
            )}
            <br />
          </>
        )}
        Snapshots: <strong>{snapshotNames.length === 0 ? 'NONE' : snapshotNames.join(', ')}</strong>
        <br />
        {prevSnapshotNames !== null && (
          <>
            Prev Snapshots:{' '}
            <strong>
              {prevSnapshotNames.length === 0 ? 'NONE' : prevSnapshotNames.join(', ')}
            </strong>
          </>
        )}
      </>
    );
    this.castEntries.push({ value, tooltip });
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
    const hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />
        </b>{' '}
        (with <SpellLink id={TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id} />) is another builder DoT
        that behaves like a long-range (but weaker) Rake. For usage advice, see the Rake section.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Moonfire uptime / snapshots</strong>
            <small> - Try to get as close to 100% as the encounter allows!</small>
          </div>
          {this.subStatistic()}
        </RoundedPanel>
        <br />
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
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
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
