import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import ArcaneOrb from '../core/ArcaneOrb';
import {
  CastEfficiencyBarElement,
  CastEfficiencyStatElement,
} from 'interface/guide/components/CastEfficiencyPanel';

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
          <b>{arcaneOrb}'s</b> primary purpose is to quickly generate {arcaneCharge}s, as it is an
          instant that generates at least 2 charges. Try to use it on cooldown, but only when you
          have 2 or fewer {arcaneCharge}s.
        </div>
      </>
    );
    const orbTargetTooltip = <>{this.arcaneOrb.missedOrbs} Arcane Orb casts with no targets hit.</>;
    const data = (
      <RoundedPanel>
        <div>
          <span
            style={{ color: qualitativePerformanceToColor(this.orbTargetUtil), fontSize: '18px' }}
          >
            {arcaneOrbIcon}{' '}
            <TooltipElement content={orbTargetTooltip}>
              {this.arcaneOrb.averageHitsPerCast.toFixed(2)} <small>avg targets hit</small>
            </TooltipElement>
          </span>
          {' / '}
          <CastEfficiencyStatElement spell={SPELLS.ARCANE_ORB} useThresholds />
        </div>
        <div>
          <strong>Arcane Orb Usage</strong>
          <PerformanceBoxRow values={this.arcaneOrbData} />
          <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
        </div>
        <CastEfficiencyBarElement spell={SPELLS.ARCANE_ORB} />
      </RoundedPanel>
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
