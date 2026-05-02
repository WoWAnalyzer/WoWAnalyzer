import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { CastEvaluation, CastOverview, StatisticData } from 'interface/guide/components';
import CastSummary from 'src/interface/guide/components/CastSummary';
import { formatPercentage } from 'common/format';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import SunfireTracker from 'analysis/retail/druid/balance/modules/spells/SunfireTracker';
import {
  CastImpact,
  CastImpactType,
} from 'analysis/retail/druid/balance/modules/spells/DebuffTracker';
import Events from 'parser/core/Events';

const BAR_COLOR = '#8F5D00';

class SunfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    sunfireTracker: SunfireTracker,
  };

  protected enemies!: Enemies;
  protected sunfireTracker!: SunfireTracker;

  private sunfireCastCount = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUNFIRE_CAST),
      this.onSunfire,
    );
  }

  onSunfire() {
    this.sunfireCastCount++;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SUNFIRE],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }

  subStatisticV2() {
    return (
      <>
        <CastOverview spell={SPELLS.SUNFIRE} stats={this.buildStats()} />
        <CastSummary spell={SPELLS.SUNFIRE} casts={this.buildCastEvaluations()} showBreakdown />
      </>
    );
  }

  private buildStats() {
    const stats = [];

    // Uptime
    const uptimePercent = this.sunfireTracker.getUptimePercent();
    const uptimePercentPerformance = this.getUptimePercentPerformance(uptimePercent);
    stats.push({
      value: `${formatPercentage(uptimePercent, 1)}%`,
      label: 'Sunfire Uptime',
      tooltip: <>Sunfire uptime percentage</>,
      performance: uptimePercentPerformance,
    } as StatisticData);

    // Cast count
    stats.push({
      value: this.sunfireCastCount.toString(),
      label: 'Sunfire Casts',
    } as StatisticData);

    // Good casts
    const castEvaluations = this.buildCastEvaluations();
    const usefulCastEvaluationsCount = castEvaluations.filter(
      (castEvaluation) =>
        castEvaluation.performance == QualitativePerformance.Perfect ||
        castEvaluation.performance == QualitativePerformance.Good ||
        castEvaluation.performance == QualitativePerformance.Ok,
    ).length;
    const usefulCastsPercent = usefulCastEvaluationsCount / castEvaluations.length;
    const usefulCastsPercentPerformance = this.getUsefulCastsPercentPerformance(usefulCastsPercent);
    stats.push({
      value: `${formatPercentage(usefulCastsPercent, 1)}%`,
      label: 'Useful casts',
      tooltip: <>Percentage of casts that were perfect/good/okay</>,
      performance: usefulCastsPercentPerformance,
    } as StatisticData);

    return stats;
  }

  private buildCastEvaluations(): CastEvaluation[] {
    const castEvaluations: CastEvaluation[] = [];
    for (const [, castImpact] of Object.entries(this.sunfireTracker.castImpactsPerEvent)) {
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

  private getUsefulCastsPercentPerformance(usefulCastsPercent: number) {
    return evaluateQualitativePerformanceByThreshold({
      actual: usefulCastsPercent,
      isGreaterThanOrEqual: {
        perfect: 0.9,
        good: 0.8,
        ok: 0.7,
      },
    });
  }

  private get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SUNFIRE.id);
  }
}

export default SunfireUptime;
