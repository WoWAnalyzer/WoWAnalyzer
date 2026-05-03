import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { CastEvaluation, CastOverview, StatisticData } from 'interface/guide/components';
import CastSummary from 'interface/guide/components/CastSummary';
import { formatPercentage } from 'common/format';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import MoonfireTracker from 'analysis/retail/druid/balance/modules/spells/DoTs/MoonfireTracker';
import Events, { CastEvent } from 'parser/core/Events';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import { DotUptimeHelper } from 'analysis/retail/druid/balance/modules/spells/DoTs/DotUptimeHelper';

const BAR_COLOR = '#5E008D';

class MoonfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    moonfireTracker: MoonfireTracker,
  };

  protected enemies!: Enemies;
  protected moonfireTracker!: MoonfireTracker;

  private moonfireCastCount = 0;
  private mainSpellCasts: CastEvent[] = [];
  private eclipseSpellCasts: CastEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_CAST),
      this.onMoonfire,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(cdSpell(this.selectedCombatant)),
      this.onMainSpell,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SOLAR_ECLIPSE, SPELLS.LUNAR_ECLIPSE]),
      this.onEclipseSpell,
    );
  }

  onMoonfire() {
    this.moonfireCastCount++;
  }

  onMainSpell(event: CastEvent) {
    this.mainSpellCasts.push(event);
  }

  onEclipseSpell(event: CastEvent) {
    this.eclipseSpellCasts.push(event);
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
    } as StatisticData);

    // Cast count
    stats.push({
      value: this.moonfireCastCount.toString(),
      label: 'Moonfire Casts',
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
      const castEvalution = DotUptimeHelper.buildCastEvaluation(
        castImpact,
        this.owner.selectedCombatant,
        this.mainSpellCasts,
        this.eclipseSpellCasts,
      );
      castEvaluations.push(castEvalution);
    }

    return castEvaluations;
  }

  private get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_DEBUFF.id);
  }
}

export default MoonfireUptime;
