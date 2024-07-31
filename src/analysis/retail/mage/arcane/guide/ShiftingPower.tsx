import { ReactNode } from 'react';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import ShiftingPowerArcane from '../talents/ShiftingPower';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class ShiftingPowerGuide extends Analyzer {
  static dependencies = {
    shiftingPower: ShiftingPowerArcane,
  };

  protected shiftingPower!: ShiftingPowerArcane;

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

  get shiftingPowerData() {
    const data: BoxRowEntry[] = [];
    this.shiftingPower.shiftingPower.forEach((sp) => {
      if (sp.usage && sp.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(sp.usage?.value, sp.usage?.tooltip, sp.cast);
        data.push({ value: sp.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const shiftingPower = <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{shiftingPower}</b> reduces your active cooldowns for every tick that you channel.
          Since Arcane revolves around your burn phases, you should use {shiftingPower} after your
          major burn phase when {arcaneSurge}, {touchOfTheMagi}, and {evocation}
          are on cooldown.
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Shifting Power Buff Usage</strong>
            <PerformanceBoxRow values={this.shiftingPowerData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div>
            <strong>Shifting Power Cast Efficiency</strong>
            <CastEfficiencyBar
              spellId={TALENTS.SHIFTING_POWER_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Shifting Power',
    );
  }
}

export default ShiftingPowerGuide;
