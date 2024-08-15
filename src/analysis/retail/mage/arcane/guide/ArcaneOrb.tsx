import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import ArcaneOrb from '../talents/ArcaneOrb';

class ArcaneOrbGuide extends Analyzer {
  static dependencies = {
    arcaneOrb: ArcaneOrb,
  };

  protected arcaneOrb!: ArcaneOrb;

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

  get orbTargetUtil() {
    const util = this.arcaneOrb.orbTargetThresholds.actual;
    const thresholds = this.arcaneOrb.orbTargetThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get arcaneOrbData() {
    const data: BoxRowEntry[] = [];
    this.arcaneOrb.orbCasts.forEach((ao) => {
      if (ao.usage && ao.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(ao.usage?.value, ao.usage?.tooltip, ao.cast);
        data.push({ value: ao.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneOrbIcon = <SpellIcon spell={SPELLS.ARCANE_ORB} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneOrb}'s</b> primary purpose is to gain you {arcaneCharge}s. Whenever you cast{' '}
          {arcaneOrb} you will gain 1 {arcaneCharge}, and whenever {arcaneOrb} hits a target, you
          will gain another {arcaneCharge}. Because this is a quick and efficient way to get
          multiple {arcaneCharge}s, you should ensure you are using {arcaneOrb} on cooldown, that it
          always hits at least one target (more is better), and that you have 2 or less{' '}
          {arcaneCharge}s when you cast it (or lower if it will hit more than 1 target).
        </div>
      </>
    );
    const orbTargetTooltip = <>{this.arcaneOrb.missedOrbs} Arcane Orb casts with no targets hit.</>;
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.orbTargetUtil), fontSize: '20px' }}
          >
            {arcaneOrbIcon}{' '}
            <TooltipElement content={orbTargetTooltip}>
              {this.arcaneOrb.averageHitsPerCast.toFixed(2)} <small>Average Targets Hit</small>
            </TooltipElement>
          </div>
          <div>
            <strong>Arcane Orb Usage</strong>
            <PerformanceBoxRow values={this.arcaneOrbData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Orb',
    );
  }
}

export default ArcaneOrbGuide;
