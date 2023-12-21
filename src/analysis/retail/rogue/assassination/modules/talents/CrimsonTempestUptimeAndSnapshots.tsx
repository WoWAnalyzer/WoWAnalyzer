import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import DotSnapshots, { SnapshotSpec } from 'parser/core/DotSnapshots';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import {
  animachargedCheckedUsageInfo,
  CRIMSON_TEMPEST_BASE_DURATION,
  getCrimsonTempestDuration,
  getCrimsonTempestFullDuration,
  SNAPSHOT_DOWNGRADE_BUFFER,
} from 'analysis/retail/rogue/assassination/constants';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/rogue';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { formatDurationMillisMinSec } from 'common/format';
import { SpellUse } from 'parser/core/SpellUsage/core';

import { getHardcast } from '../../normalizers/CastLinkNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { RoundedPanelWithBottomMargin } from 'analysis/retail/rogue/shared/styled-components';

export default class CrimsonTempestUptimeAndSnapshots extends DotSnapshots {
  static dependencies = {
    ...DotSnapshots.dependencies,
    enemies: Enemies,
  };

  cooldownUses: SpellUse[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(TALENTS.CRIMSON_TEMPEST_TALENT, TALENTS.CRIMSON_TEMPEST_TALENT, [], options);
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    const fromHardcast = getHardcast(event);
    if (fromHardcast) {
      return getCrimsonTempestDuration(fromHardcast);
    }

    console.warn(
      "Couldn't find what cast produced Crimson Tempest application - assuming base duration",
      event,
    );
    return CRIMSON_TEMPEST_BASE_DURATION;
  }

  getDotFullDuration(): number {
    return getCrimsonTempestFullDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(TALENTS.CRIMSON_TEMPEST_TALENT.id);
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
          Unacceptable downgrade of snapshot. Try not to overwrite your snapshotted Crimson Tempest
          unless it's within the last {formatDurationMillisMinSec(SNAPSHOT_DOWNGRADE_BUFFER)}.
        </div>
      );
    }
    if (clipped > 0) {
      snapshotPerformance = wasUpgrade ? QualitativePerformance.Ok : QualitativePerformance.Fail;
      snapshotSummary = wasUpgrade ? (
        <div>Clipped but upgraded existing snapshotted Crimson Tempest</div>
      ) : (
        <div>Clipped existing snapshotted Crimson Tempest</div>
      );
      snapshotDetails = wasUpgrade ? (
        <div>
          Clipped but upgraded existing snapshotted Crimson Tempest. Try not to clip your
          snapshotted Crimson Tempest.
        </div>
      ) : (
        <div>
          Clipped existing snapshotted Crimson Tempest. Try not to clip your snapshotted Crimson
          Tempest.
        </div>
      );
    }

    const actualChecklistItems = animachargedCheckedUsageInfo(this.selectedCombatant, cast, [
      {
        check: 'snapshot',
        timestamp: cast.timestamp,
        performance: snapshotPerformance,
        summary: snapshotSummary,
        details: snapshotDetails,
      },
    ]);
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

    // TODO also highlight 'bad' Crimson Tempests in the timeline
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS.CRIMSON_TEMPEST_TALENT.id);
  }

  /** Subsection explaining the use of Crimson Tempest and providing performance statistics */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.CRIMSON_TEMPEST_TALENT} />
        </strong>{' '}
        is your highest damage-per-energy AoE spender. Try to maintain 100% uptime. Don't refresh
        early.
      </p>
    );

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        abovePerformanceDetails={
          <RoundedPanelWithBottomMargin>
            <div>
              <strong>Crimson Tempest uptime / snapshots</strong>
              <small> - Try to get as close to 100% as the encounter allows!</small>
            </div>
            {this.subStatistic()}
          </RoundedPanelWithBottomMargin>
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
        spells: [TALENTS.CRIMSON_TEMPEST_TALENT],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}
