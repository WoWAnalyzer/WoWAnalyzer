import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { CastEvaluation, CastOverview } from 'interface/guide/components';
import CastSummary from 'src/interface/guide/components/CastSummary';
import { formatPercentage } from 'common/format';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import EarlyDotRefreshesInstants from 'analysis/retail/druid/balance/modules/features/EarlyDotRefreshesInstants';
import MoonfireTracker, {
  CastImpact,
  CastImpactType,
} from 'analysis/retail/druid/balance/modules/spells/MoonfireTracker';

const BAR_COLOR = '#5E008D';

class MoonfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    moonfireTracker: MoonfireTracker,
  };

  protected enemies!: Enemies;
  protected earlyDotRefreshesInstants!: EarlyDotRefreshesInstants;
  protected moonfireTracker!: MoonfireTracker;

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_DEBUFF.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.MOONFIRE_DEBUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }

  subStatisticV2() {
    return (
      <>
        <CastOverview spell={SPELLS.MOONFIRE_DEBUFF} stats={this.buildStats()} />
        <CastSummary
          spell={SPELLS.MOONFIRE_DEBUFF}
          casts={this.buildCastEvaluations()}
          showBreakdown
        />
      </>
    );
  }

  private buildStats() {
    const stats = [];

    // Uptime
    const uptimePercent = this.moonfireTracker.getUptimePercent();
    const uptimePercentPerformance = this.getUptimePercentPerformance(uptimePercent);
    stats.push({
      value: `${formatPercentage(uptimePercent, 1)}%`,
      label: 'Moonfire Uptime',
      tooltip: <>Moonfire uptime percentage</>,
      performance: uptimePercentPerformance,
    });

    // Good casts
    const castEvaluations = this.buildCastEvaluations();
    const goodCastEvaluationsCount = castEvaluations.filter(
      (castEvaluation) =>
        castEvaluation.performance == QualitativePerformance.Perfect ||
        castEvaluation.performance == QualitativePerformance.Good,
    ).length;
    const goodCastsPercent = goodCastEvaluationsCount / castEvaluations.length;
    stats.push({
      value: `${formatPercentage(goodCastsPercent, 1)}%`,
      label: 'Good casts',
      tooltip: <>Percentage of good/perfect casts as described below.</>,
    });

    return stats;
  }

  private getUptimePercentPerformance(uptimePercent: number) {
    return evaluateQualitativePerformanceByThreshold({
      actual: uptimePercent,
      isGreaterThanOrEqual: {
        perfect: 0.95,
        good: 0.9,
        ok: 0.85,
      },
    });
  }

  private buildCastEvaluations(): CastEvaluation[] {
    const castEvaluations: CastEvaluation[] = [];
    for (const [, castImpact] of Object.entries(this.moonfireTracker.castImpactsPerEvent)) {
      const castEvalution = this.buildCastEvaluation(castImpact);
      castEvaluations.push(castEvalution);
    }

    return castEvaluations;
  }

  private buildCastEvaluation(castImpact: CastImpact): CastEvaluation {
    let newDebuffCount = 0;
    let refreshCount = 0;
    let overwriteCount = 0;
    for (const [, castImpactPerTargetId] of Object.entries(castImpact.castImpactPerTargetId)) {
      if (castImpactPerTargetId.castImpactType == CastImpactType.NewDebuff) {
        newDebuffCount++;
      }

      if (castImpactPerTargetId.castImpactType == CastImpactType.RefreshDuringPandemicWindow) {
        refreshCount++;
      }

      if (castImpactPerTargetId.castImpactType == CastImpactType.Overwrite) {
        overwriteCount++;
      }
    }

    let performance = QualitativePerformance.Ok;
    if (overwriteCount > 0 && newDebuffCount == 0 && refreshCount == 0) {
      performance = QualitativePerformance.Fail;
    }

    if (overwriteCount <= newDebuffCount + refreshCount) {
      performance = QualitativePerformance.Good;
    }

    if (overwriteCount == 0) {
      performance = QualitativePerformance.Perfect;
    }

    return {
      timestamp: castImpact.castEvent.timestamp,
      performance: performance,
      reason: `${newDebuffCount} created, ${refreshCount} refreshed, ${overwriteCount} overwriten`,
    };
  }
}

export default MoonfireUptime;
