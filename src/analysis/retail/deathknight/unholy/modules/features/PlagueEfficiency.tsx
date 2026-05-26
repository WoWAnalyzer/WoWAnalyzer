import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import type { JSX } from 'react';

const PERFECT_DISEASE_UPTIME_THRESHOLD = 0.99;
const GOOD_DISEASE_UPTIME_THRESHOLD = 0.97;
const OK_DISEASE_UPTIME_THRESHOLD = 0.95;
const TARGET_DISEASE_UPTIME_PERCENT = Math.round(PERFECT_DISEASE_UPTIME_THRESHOLD * 100);
const TRACKED_DISEASES = [SPELLS.VIRULENT_PLAGUE, SPELLS.DREAD_PLAGUE] as const;

class PlagueEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;
  private diseaseMetricsCache?: Array<{
    spell: (typeof TRACKED_DISEASES)[number];
    uptime: number;
    history: ReturnType<Enemies['getDebuffHistory']>;
    performance: QualitativePerformance;
  }>;

  private getDiseaseUptime(spellId: number) {
    return this.enemies.getBuffUptime(spellId) / this.owner.fightDuration;
  }

  private getDiseasePerformance(uptime: number): QualitativePerformance {
    if (uptime >= PERFECT_DISEASE_UPTIME_THRESHOLD) {
      return QualitativePerformance.Perfect;
    }
    if (uptime >= GOOD_DISEASE_UPTIME_THRESHOLD) {
      return QualitativePerformance.Good;
    }
    if (uptime >= OK_DISEASE_UPTIME_THRESHOLD) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  private getDiseaseMetrics(disease: (typeof TRACKED_DISEASES)[number]) {
    const uptime = this.getDiseaseUptime(disease.id);
    return {
      spell: disease,
      uptime,
      history: this.enemies.getDebuffHistory(disease.id),
      performance: this.getDiseasePerformance(uptime),
    };
  }

  private get diseaseMetrics() {
    if (!this.diseaseMetricsCache) {
      this.diseaseMetricsCache = TRACKED_DISEASES.map((disease) => this.getDiseaseMetrics(disease));
    }

    return this.diseaseMetricsCache;
  }

  get guideSubsection(): JSX.Element {
    const diseaseMetrics = this.diseaseMetrics;

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
        <div style={{ marginBottom: '6px' }}>
          <strong>Disease timeline</strong>
        </div>
        <p>
          Keep both diseases rolling with minimal gaps. {TARGET_DISEASE_UPTIME_PERCENT}%+ uptime is
          the goal.
        </p>
        {diseaseMetrics.map((disease) => (
          <div key={disease.spell.id}>
            {uptimeBarSubStatistic(this.owner.fight, {
              spells: [disease.spell],
              uptimes: disease.history,
              perf: disease.performance,
            })}
          </div>
        ))}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    const diseaseMetrics = this.diseaseMetrics;

    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        {diseaseMetrics.map((disease) => (
          <BoringSpellValueText key={disease.spell.id} spell={disease.spell.id}>
            <UptimeIcon /> {formatPercentage(disease.uptime)}% <small>Disease Uptime</small>
          </BoringSpellValueText>
        ))}
      </Statistic>
    );
  }
}

export default PlagueEfficiency;
