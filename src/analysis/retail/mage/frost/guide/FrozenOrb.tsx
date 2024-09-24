import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import FrozenOrb from '../talents/FrozenOrb';
import { ReactNode } from 'react';

const AOE_THRESHOLD = 3;
const FINGERS_FROST_STACK_THRESHOLD = 2;

class FrozenOrbGuide extends Analyzer {
  static dependencies = {
    frozenOrb: FrozenOrb,
  };

  protected frozenOrb!: FrozenOrb;

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
    let targetsHit = 0;
    let performance = QualitativePerformance.Good;
    this.frozenOrb.orbCasts.forEach((fo) => (targetsHit += fo.targetsHit));
    if (targetsHit / this.frozenOrb.orbCasts.length < 1) {
      performance = QualitativePerformance.Fail;
    }
    return performance;
  }

  get frozenOrbData() {
    const data: BoxRowEntry[] = [];
    this.frozenOrb.orbCasts.forEach((fo) => {
      if (fo.targetsHit < AOE_THRESHOLD && fo.ffstacks >= FINGERS_FROST_STACK_THRESHOLD) {
        const performance = QualitativePerformance.Fail;
        const tooltipText = `Frozen Orb cast with ${fo.ffstacks} stacks of Fingers of Frost during Single Target/Cleave.`;
        const tooltip = this.generateGuideTooltip(performance, tooltipText, fo.cast.timestamp);
        data.push({ value: performance, tooltip });
      } else {
        const performance = QualitativePerformance.Good;
        const tooltipText = `Good Frozen Orb Cast`;
        const tooltip = this.generateGuideTooltip(performance, tooltipText, fo.cast.timestamp);
        data.push({ value: performance, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const frozenOrb = <SpellLink spell={TALENTS.FROZEN_ORB_TALENT} />;
    const fingersOfFrost = <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />;

    const frozenOrbIcon = <SpellIcon spell={TALENTS.FROZEN_ORB_TALENT} />;

    const explanation = (
      <>
        <p>Try to mantain {frozenOrb} on CD as much as you can.</p>
        {this.selectedCombatant.hasTalent(TALENTS.FREEZING_WINDS_TALENT) && (
          <p>
            As it will generate {fingersOfFrost} procs, don't cast it when you have 2{' '}
            {fingersOfFrost} procs.
          </p>
        )}
      </>
    );
    const averageTargetsTooltip = <>{this.frozenOrb.averageTargetsHit} Targets Hit on Average.</>;
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <span
              style={{ color: qualitativePerformanceToColor(this.orbTargetUtil), fontSize: '18px' }}
            >
              {frozenOrbIcon}{' '}
              <TooltipElement content={averageTargetsTooltip}>
                {this.frozenOrb.averageTargetsHit.toFixed(2)} <small>avg targets hit</small>
              </TooltipElement>
            </span>
          </div>
          <div>
            <strong>Frozen Orb Usage</strong>
            <PerformanceBoxRow values={this.frozenOrbData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Frozen Orb',
    );
  }
}

export default FrozenOrbGuide;
