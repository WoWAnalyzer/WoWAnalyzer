import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import { getRakeDuration, SNAPSHOT_DOWNGRADE_BUFFER } from 'analysis/retail/druid/feral/constants';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import Snapshots, {
  PROWL_SPEC,
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import { proccedBloodtalons } from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

/** Tracking code for everything Rake related */
class RakeUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(SPELLS.RAKE, SPELLS.RAKE_BLEED, [TIGERS_FURY_SPEC, PROWL_SPEC], options);
  }

  getDotExpectedDuration(): number {
    return getRakeDuration(this.selectedCombatant);
  }

  getDotFullDuration(): number {
    return getRakeDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id);
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
      return; // no handling needed for 'uncontrolled' rakes from DCR or Convoke
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
    this.castEntries.push({
      value,
      tooltip,
    });

    // TODO also highlight 'bad' Rakes in the timeline
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RAKE_BLEED.id);
  }

  /** Subsection explaining the use of Rake and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.RAKE.id} />
        </b>{' '}
        is your highest damage-per-energy single target builder. Try to keep it active on all
        targets (except when in a many-target AoE situation). Rake snapshots{' '}
        <SpellLink id={SPELLS.TIGERS_FURY.id} /> and{' '}
        <SpellLink id={TALENTS_DRUID.POUNCING_STRIKES_TALENT.id} /> - when forced to refresh with a
        weaker snapshot, try to wait until the last moment in order to overwrite the minimum amount
        of the stronger DoT.
        {hasBt && (
          <>
            {' '}
            It's always acceptable to do a sub-optimal Rake cast if needed to proc{' '}
            <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Rake uptime / snapshots</strong>
            <small> - Try to get as close to 100% as the encounter allows!</small>
          </div>
          {this.subStatistic()}
        </RoundedPanel>
        <br />
        <strong>Rake casts</strong>
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
        spells: [SPELLS.RAKE_BLEED],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default RakeUptimeAndSnapshots;
