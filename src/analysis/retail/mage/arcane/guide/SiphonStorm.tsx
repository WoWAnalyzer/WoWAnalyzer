import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import SiphonStorm from '../talents/SiphonStorm';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class SiphonStormGuide extends Analyzer {
  static dependencies = {
    siphonStorm: SiphonStorm,
  };

  protected siphonStorm!: SiphonStorm;

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

  get siphonStormData() {
    const data: BoxRowEntry[] = [];
    this.siphonStorm.siphonStormBuffs.forEach((ss) => {
      if (ss.usage && ss.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(ss.usage?.value, ss.usage?.tooltip, ss.applied);
        data.push({ value: ss.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{siphonStorm}</b> gets applied to you every time you channel {evocation} and increases
          your intellect for every 0.5 seconds you channel {evocation}. Additionally, the cooldown
          of {evocation} lines up perfectly with {arcaneSurge}, so you should channel {evocation}{' '}
          before the pull so you have the buff for your opener, and then channel it again before
          every major burn phase (whenever {arcaneSurge} is available) to get a large damage buff on
          the hardest hitting portion of your rotation.
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Siphon Storm Buff Usage</strong>
            <PerformanceBoxRow values={this.siphonStormData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div>
            <strong>Evocation Cast Efficiency</strong>
            <CastEfficiencyBar
              spellId={TALENTS.EVOCATION_TALENT.id}
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
      'Siphon Storm',
    );
  }
}

export default SiphonStormGuide;
