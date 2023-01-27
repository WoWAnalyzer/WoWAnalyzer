import SPELLS from 'common/SPELLS/rogue';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import DotSnapshots, { SnapshotSpec } from 'parser/core/DotSnapshots';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import {
  animachargedCheckedUsageInfo,
  getRuptureDuration,
  getRuptureFullDuration,
  RUPTURE_BASE_DURATION,
  SNAPSHOT_DOWNGRADE_BUFFER,
} from 'analysis/retail/rogue/assassination/constants';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { formatDurationMillisMinSec } from 'common/format';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';

import { getHardcast } from '../../normalizers/CastLinkNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

export default class RuptureUptimeAndSnapshots extends DotSnapshots {
  static dependencies = {
    ...DotSnapshots.dependencies,
    enemies: Enemies,
  };

  cooldownUses: SpellUse[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.RUPTURE, SPELLS.RUPTURE, [], options);
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    const fromHardcast = getHardcast(event);
    if (fromHardcast) {
      return getRuptureDuration(fromHardcast);
    }

    console.warn(
      "Couldn't find what cast produced Rupture application - assuming base duration",
      event,
    );
    return RUPTURE_BASE_DURATION;
  }

  getDotFullDuration(): number {
    return getRuptureFullDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RUPTURE.id);
  }

  handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: SnapshotSpec[],
    prevSnapshots: SnapshotSpec[] | null,
    power: number,
    prevPower: number,
    remainingOnPrev: number,
    clipped: number,
  ): void {
    const cast = getHardcast(application);
    if (!cast) {
      return;
    }

    // log the cast
    // const targetName = this.owner.getTargetName(cast);
    // const snapshotNames = snapshots.map((ss) => ss.name);
    // const prevSnapshotNames = prevSnapshots === null ? null : prevSnapshots.map((ss) => ss.name);
    const wasUnacceptableDowngrade =
      prevPower > power && remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER;
    const wasUpgrade = prevPower < power;

    let snapshotPerformance: QualitativePerformance = QualitativePerformance.Good;
    let snapshotSummary = <div>Good snapshot usage</div>;
    let snapshotDetails = <div>Good snapshot usage.</div>;
    if (wasUnacceptableDowngrade) {
      snapshotPerformance = QualitativePerformance.Fail;
      snapshotSummary = <div>Unacceptable downgrade of snapshot</div>;
      snapshotDetails = (
        <div>
          Unacceptable downgrade of snapshot. Try not to overwrite your snapshotted Rupture unless
          it's within the last {formatDurationMillisMinSec(SNAPSHOT_DOWNGRADE_BUFFER)}.
        </div>
      );
    }
    if (clipped > 0) {
      snapshotPerformance = wasUpgrade ? QualitativePerformance.Ok : QualitativePerformance.Fail;
      snapshotSummary = wasUpgrade ? (
        <div>Clipped but upgraded existing snapshotted Rupture</div>
      ) : (
        <div>Clipped existing snapshotted Rupture</div>
      );
      snapshotDetails = wasUpgrade ? (
        <div>
          Clipped but upgraded existing snapshotted Rupture. Try not to clip your snapshotted
          Rupture.
        </div>
      ) : (
        <div>Clipped existing snapshotted Rupture. Try not to clip your snapshotted Rupture.</div>
      );
    }

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'snapshot',
        timestamp: cast.timestamp,
        performance: snapshotPerformance,
        summary: snapshotSummary,
        details: snapshotDetails,
      },
    ];

    // const tooltip = (
    //   <>
    //     @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
    //     <strong>{targetName || 'unknown'}</strong>
    //     <br />
    //     {prevSnapshotNames !== null && (
    //       <>
    //         Refreshed on target w/ {(remainingOnPrev / 1000).toFixed(1)}s remaining{' '}
    //         {clipped > 0 && (
    //           <>
    //             <strong>- Clipped {(clipped / 1000).toFixed(1)}s!</strong>
    //           </>
    //         )}
    //         <br />
    //       </>
    //     )}
    //     Snapshots: <strong>{snapshotNames.length === 0 ? 'NONE' : snapshotNames.join(', ')}</strong>
    //     <br />
    //     {prevSnapshotNames !== null && (
    //       <>
    //         Prev Snapshots:{' '}
    //         <strong>
    //           {prevSnapshotNames.length === 0 ? 'NONE' : prevSnapshotNames.join(', ')}
    //         </strong>
    //       </>
    //     )}
    //   </>
    // );

    const actualChecklistItems = animachargedCheckedUsageInfo(
      this.selectedCombatant,
      cast,
      checklistItems,
    );
    const actualPerformance = combineQualitativePerformances(
      actualChecklistItems.map((it) => it.performance),
    );

    this.cooldownUses.push({
      event: cast,
      performance: actualPerformance,
      checklistItems: actualChecklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });

    // TODO also highlight 'bad' Ruptures in the timeline
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RUPTURE.id);
  }

  /** Subsection explaining the use of Rupture and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={SPELLS.RUPTURE.id} />
        </strong>{' '}
        is your highest damage-per-energy single target spender. Try to maintain 100% uptime. Don't
        refresh early.
      </p>
    );

    const performances = this.cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    return (
      <SpellUsageSubSection
        explanation={explanation}
        performance={performances}
        uses={this.cooldownUses}
        abovePerformanceDetails={
          <RoundedPanel>
            <div>
              <strong>Rupture uptime / snapshots</strong>
              <small> - Try to get as close to 100% as the encounter allows!</small>
            </div>
            {this.subStatistic()}
          </RoundedPanel>
        }
        castBreakdownSmallText={
          <>
            {' '}
            - Blue is an Animacharged cast, Green is a good cast, Yellow is an ok cast (clipped
            duration but upgraded snapshot), Red is a bad cast (clipped duration or downgraded
            snapshot w/ &gt;
            {formatDurationMillisMinSec(SNAPSHOT_DOWNGRADE_BUFFER)} remaining).
          </>
        }
      />
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.RUPTURE],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}
