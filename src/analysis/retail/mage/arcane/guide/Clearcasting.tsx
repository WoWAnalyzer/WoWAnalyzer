import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import Clearcasting from '../core/Clearcasting';

class ClearcastingGuide extends Analyzer {
  static dependencies = {
    clearcasting: Clearcasting,
  };

  protected clearcasting!: Clearcasting;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipText: ReactNode,
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}: {tooltipText}
        </div>
      </>
    );
    return tooltip;
  }

  get clearcastingData() {
    const data: BoxRowEntry[] = [];
    this.clearcasting.clearcastingProcs.forEach((cc) => {
      if (cc.castUsage && cc.castUsage?.tooltip) {
        const tooltip = this.generateGuideTooltip(
          cc.castUsage?.value,
          cc.castUsage?.tooltip,
          cc.applied,
        );
        data.push({ value: cc.castUsage?.value, tooltip });
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
            <strong>Clearcasting Buff Usage</strong>
            <PerformanceBoxRow values={this.clearcastingData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
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
