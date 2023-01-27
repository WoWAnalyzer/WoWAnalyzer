import SPELLS from 'common/SPELLS/rogue';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import DotSnapshots, { SnapshotSpec } from 'parser/core/DotSnapshots';
import { IMPROVED_GARROTE_SPEC, NIGHTSTALKER_SPEC } from '../core/Snapshots';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import {
  animachargedCheckedUsageInfo,
  getGarroteDuration,
  SNAPSHOT_DOWNGRADE_BUFFER,
} from 'analysis/retail/rogue/assassination/constants';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/rogue';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { formatDurationMillisMinSec } from 'common/format';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

export default class GarroteUptimeAndSnapshots extends DotSnapshots {
  static dependencies = {
    ...DotSnapshots.dependencies,
    enemies: Enemies,
  };

  cooldownUses: SpellUse[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.GARROTE, SPELLS.GARROTE, [NIGHTSTALKER_SPEC, IMPROVED_GARROTE_SPEC], options);
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    return getGarroteDuration();
  }

  getDotFullDuration(): number {
    return getGarroteDuration();
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.GARROTE.id);
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
          Unacceptable downgrade of snapshot. Try not to overwrite your snapshotted Garrote unless
          it's within the last {formatDurationMillisMinSec(SNAPSHOT_DOWNGRADE_BUFFER)}.
        </div>
      );
    }
    if (clipped > 0) {
      snapshotPerformance = wasUpgrade ? QualitativePerformance.Ok : QualitativePerformance.Fail;
      snapshotSummary = wasUpgrade ? (
        <div>Clipped but upgraded existing snapshotted Garrote</div>
      ) : (
        <div>Clipped existing snapshotted Garrote</div>
      );
      snapshotDetails = wasUpgrade ? (
        <div>
          Clipped but upgraded existing snapshotted Garrote. Try not to clip your snapshotted
          Garotte.
        </div>
      ) : (
        <div>Clipped existing snapshotted Garrote. Try not to clip your snapshotted Garotte.</div>
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

    // TODO also highlight 'bad' Garrotes in the timeline
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.GARROTE.id);
  }

  /** Subsection explaining the use of Garrote and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={SPELLS.GARROTE.id} />
        </strong>{' '}
        is your highest damage-per-energy single target builder. Try to keep it active on all
        targets (except when in a many-target AoE situation). Garrote snapshots{' '}
        <SpellLink id={TALENTS.NIGHTSTALKER_TALENT.id} /> and{' '}
        <SpellLink id={TALENTS.IMPROVED_GARROTE_TALENT.id} /> - when forced to refresh with a weaker
        snapshot, try to wait until the last moment in order to overwrite the minimum amount of the
        stronger DoT.
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
              <strong>Garrote uptime / snapshots</strong>
              <small> - Try to get as close to 100% as the encounter allows!</small>
            </div>
            {this.subStatistic()}
          </RoundedPanel>
        }
        castBreakdownSmallText={
          <>
            {' '}
            - Green is a good cast, Yellow is an ok cast (clipped duration but upgraded snapshot),
            Red is a bad cast (clipped duration or downgraded snapshot w/ &gt;
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
        spells: [SPELLS.GARROTE],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}
