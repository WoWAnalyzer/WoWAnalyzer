import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

import Clearcasting from '../core/Clearcasting';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

class ClearcastingGuide extends Analyzer {
  static dependencies = {
    clearcasting: Clearcasting,
  };

  protected clearcasting!: Clearcasting;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipItems: { perf: QualitativePerformance; detail: string }[],
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}
        </div>
        <div>
          {tooltipItems.map((t, i) => (
            <div key={i}>
              <PerformanceMark perf={t.perf} /> {t.detail}
              <br />
            </div>
          ))}
        </div>
      </>
    );
    return tooltip;
  }

  get clearcastingData() {
    const data: BoxRowEntry[] = [];
    this.clearcasting.clearcastingProcs.forEach((cc) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      if (cc.expired) {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: `Clearcasting Expired` });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (!cc.expired) {
        overallPerf = QualitativePerformance.Good;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, cc.applied);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;

    const explanation = (
      <>
        <div>
          Ensure you are spending your <b>{clearcasting}</b> procs. You should never let them expire
          without getting used, unless you have no choice because of forced downtime, and you should
          avoid overcapping on procs.
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <CastSummaryAndBreakdown
              spell={SPELLS.CLEARCASTING_ARCANE}
              castEntries={this.clearcastingData}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Clearcasting',
    );
  }
}

export default ClearcastingGuide;
