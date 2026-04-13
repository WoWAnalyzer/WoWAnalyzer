import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import {
  CLIP_BUFFER,
  getRakeDuration,
  SNAPSHOT_DOWNGRADE_BUFFER,
} from 'analysis/retail/druid/feral/constants';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import Snapshots, {
  PROWL_SPEC,
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BadColor, OkColor } from 'interface/guide';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

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
    const snapshotNames = snapshots.map((ss) => ss.name);
    const prevSnapshotNames = prevSnapshots === null ? null : prevSnapshots.map((ss) => ss.name);
    const wasUnacceptableDowngrade =
      prevPower > power && remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER;
    const wasUpgrade = prevPower < power;

    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    if (wasUnacceptableDowngrade) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad because you refreshed early with a weaker snapshot
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
        </h5>
      );
    } else if (clipped > CLIP_BUFFER) {
      if (wasUpgrade) {
        value = QualitativePerformance.Ok;
        perfExplanation = (
          <h5 style={{ color: OkColor }}>
            You refreshed this too early, but upgraded the snapshot
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
          </h5>
        );
      } else {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <h5 style={{ color: BadColor }}>
            Bad because you refreshed too early
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
          </h5>
        );
      }
    } else if (clipped > 0) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          Careful, you refreshed this a little early
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
        </h5>
      );
    }

    const tooltip = (
      <>
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        {prevSnapshotNames !== null && (
          <>
            Refreshed on target w/ {(remainingOnPrev / 1000).toFixed(1)}s remaining{' '}
            {clipped > 0 && (
              <>
                <strong>- Clipped {(clipped / 1000).toFixed(1)}s!</strong>
              </>
            )}
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
          </>
        )}
        Snapshots: <strong>{snapshotNames.length === 0 ? 'NONE' : snapshotNames.join(', ')}</strong>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
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
    return this.combinedUptimeHistory;
  }

  /** Subsection explaining the use of Rake and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.RAKE} />
        </b>{' '}
        is your highest damage-per-energy single target builder. Try to keep it active on all
        targets (except when in a many-target AoE situation). Rake snapshots{' '}
        <SpellLink spell={SPELLS.TIGERS_FURY} /> and{' '}
        <SpellLink spell={TALENTS_DRUID.POUNCING_STRIKES_TALENT} /> - when forced to refresh with a
        weaker snapshot, try to wait until the last moment in order to overwrite the minimum amount
        of the stronger DoT.
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
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        <CastSummaryAndBreakdown
          spell={SPELLS.RAKE}
          castEntries={this.castEntries}
          okExtraExplanation={<>clipped duration but upgraded snapshot</>}
          badExtraExplanation={<>clipped duration or downgraded snapshot w/ &gt;2s remaining</>}
        />
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
