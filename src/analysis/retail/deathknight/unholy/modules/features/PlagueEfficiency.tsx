import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { PerformanceLabel } from 'parser/ui/PerformanceLabel';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import type { JSX } from 'react';

const PERFECT_DREAD_COVERAGE_THRESHOLD = 1;
const GOOD_DREAD_COVERAGE_THRESHOLD = 0.99;
const OK_DREAD_COVERAGE_THRESHOLD = 0.98;
const TARGET_DREAD_COVERAGE_PERCENT = Math.round(GOOD_DREAD_COVERAGE_THRESHOLD * 100);
const TIMELINE_ROW_SPACING_ADJUSTMENT_PX = -16;

type DiseaseSpell = typeof SPELLS.VIRULENT_PLAGUE | typeof SPELLS.DREAD_PLAGUE;

type DiseaseMetric = {
  spell: DiseaseSpell;
  uptime: number;
  history: ReturnType<Enemies['getDebuffHistory']>;
};

type DreadPlagueCoverageMetric = {
  uptime: number;
  performance: QualitativePerformance;
};

type DiseaseMetricKey = 'virulent' | 'dread';

class PlagueEfficiency extends Analyzer.withDependencies({
  enemies: Enemies,
}) {
  private diseaseMetricsCache?: Record<DiseaseMetricKey, DiseaseMetric>;
  private dreadPlagueCoverageCache?: DreadPlagueCoverageMetric;

  private getDiseaseUptime(spellId: number) {
    return this.deps.enemies.getBuffUptime(spellId) / this.owner.fightDuration;
  }

  private getDiseaseMetrics(disease: DiseaseSpell): DiseaseMetric {
    const uptime = this.getDiseaseUptime(disease.id);
    return {
      spell: disease,
      uptime,
      history: this.deps.enemies.getDebuffHistory(disease.id),
    };
  }

  private getCoveragePerformance(uptime: number): QualitativePerformance {
    if (uptime >= PERFECT_DREAD_COVERAGE_THRESHOLD) {
      return QualitativePerformance.Perfect;
    }
    if (uptime >= GOOD_DREAD_COVERAGE_THRESHOLD) {
      return QualitativePerformance.Good;
    }
    if (uptime >= OK_DREAD_COVERAGE_THRESHOLD) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  private get diseaseMetrics() {
    this.diseaseMetricsCache ??= {
      virulent: this.getDiseaseMetrics(SPELLS.VIRULENT_PLAGUE),
      dread: this.getDiseaseMetrics(SPELLS.DREAD_PLAGUE),
    };

    return this.diseaseMetricsCache;
  }

  private get timelineMetrics() {
    const diseaseMetrics = this.diseaseMetrics;
    return [diseaseMetrics.virulent, diseaseMetrics.dread] as const;
  }

  private get dreadPlagueCoverage() {
    this.dreadPlagueCoverageCache ??= (() => {
      const diseaseMetrics = this.diseaseMetrics;
      const uptime =
        diseaseMetrics.virulent.uptime === 0
          ? 0
          : diseaseMetrics.dread.uptime / diseaseMetrics.virulent.uptime;
      return {
        uptime,
        performance: this.getCoveragePerformance(uptime),
      };
    })();

    return this.dreadPlagueCoverageCache;
  }

  get guideSubsection(): JSX.Element {
    const timelineMetrics = this.timelineMetrics;
    const dreadPlagueCoverage = this.dreadPlagueCoverage;

    const explanation = (
      <>
        <p>
          Keep <SpellLink spell={SPELLS.VIRULENT_PLAGUE} /> and{' '}
          <SpellLink spell={SPELLS.DREAD_PLAGUE} /> active for as much of the fight as possible.
          Strong disease uptime is core to Unholy pressure and feeds several talent interactions.
        </p>
        <p>
          With <SpellLink spell={TALENTS.FORBIDDEN_KNOWLEDGE_3_UNHOLY_TALENT} />,{' '}
          <SpellLink spell={SPELLS.DREAD_PLAGUE} /> can rouse additional{' '}
          <SpellLink spell={SPELLS.LESSER_GHOUL} />s to <SpellLink spell={TALENTS.PUTREFY_TALENT} />
          . With <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} />, keeping{' '}
          <SpellLink spell={SPELLS.DREAD_PLAGUE} /> active also sustains that proc engine.
        </p>
      </>
    );

    const data = (
      <div>
        <div style={{ marginBottom: '14px' }}>
          <strong>
            Primary metric: <SpellLink spell={SPELLS.DREAD_PLAGUE} /> during{' '}
            <SpellLink spell={SPELLS.VIRULENT_PLAGUE} />
          </strong>
          <div style={{ fontSize: '1.5em', fontWeight: 700, marginTop: '4px', lineHeight: 1.1 }}>
            <PerformanceLabel performance={dreadPlagueCoverage.performance}>
              {formatPercentage(dreadPlagueCoverage.uptime)}%
            </PerformanceLabel>
          </div>
          <small>
            Target: {TARGET_DREAD_COVERAGE_PERCENT}%+ coverage while{' '}
            <SpellLink spell={SPELLS.VIRULENT_PLAGUE} /> is active.
          </small>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>Disease timeline</strong>
        </div>
        <p>
          Keep <SpellLink spell={SPELLS.VIRULENT_PLAGUE} /> rolling with minimal gaps.
          <SpellLink spell={SPELLS.DREAD_PLAGUE} /> should mirror that uptime as closely as
          possible.
        </p>
        {timelineMetrics.map((metric, index) => (
          <div
            key={metric.spell.id}
            style={
              index === 0 ? { marginBottom: `${TIMELINE_ROW_SPACING_ADJUSTMENT_PX}px` } : undefined
            }
          >
            {uptimeBarSubStatistic(this.owner.fight, {
              spells: [metric.spell],
              uptimes: metric.history,
            })}
          </div>
        ))}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    const timelineMetrics = this.timelineMetrics;
    const dreadPlagueCoverage = this.dreadPlagueCoverage;

    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <BoringSpellValueText spell={SPELLS.DREAD_PLAGUE.id}>
          <PerformanceLabel performance={dreadPlagueCoverage.performance}>
            {' '}
            {formatPercentage(dreadPlagueCoverage.uptime)}%
          </PerformanceLabel>{' '}
          <small>Efficiency</small>
        </BoringSpellValueText>
        {timelineMetrics.map((metric) => (
          <BoringSpellValueText key={metric.spell.id} spell={metric.spell.id}>
            <UptimeIcon /> {formatPercentage(metric.uptime)}% <small>Uptime</small>
          </BoringSpellValueText>
        ))}
      </Statistic>
    );
  }
}

export default PlagueEfficiency;
