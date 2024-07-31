import { ReactNode } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { SpellSeq } from 'parser/ui/SpellSeq';

import TouchOfTheMagi from '../talents/TouchOfTheMagi';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class TouchOfTheMagiGuide extends Analyzer {
  static dependencies = {
    touchOfTheMagi: TouchOfTheMagi,
  };

  protected touchOfTheMagi!: TouchOfTheMagi;

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

  get activeTimeUtil() {
    const util = this.touchOfTheMagi.touchMagiActiveTimeThresholds.actual;
    const thresholds = this.touchOfTheMagi.touchMagiActiveTimeThresholds.isLessThan;
    let performance = QualitativePerformance.Good;
    if (util >= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get touchMagiData() {
    const data: BoxRowEntry[] = [];
    this.touchOfTheMagi.touchCasts.forEach((tm) => {
      if (tm.usage && tm.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(tm.usage?.value, tm.usage?.tooltip, tm.applied);
        data.push({ value: tm.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const touchOfTheMagiIcon = <SpellIcon spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{touchOfTheMagi}</b> is a short duration debuff and is available for each burn phase,
          accumulating 20% of your damage. When the debuff expires it explodes dealing the
          accumulated damage to the target and reduced damage to nearby enemies. To maximize your
          burst, refer to the below:
        </div>
        <div>
          <ul>
            <li>
              Using the standard rotation, cast as many spells as possible at the debuffed target
              until the debuff expires.
            </li>
            <li>
              {touchOfTheMagi} gives you 4 {arcaneCharge}s, so spend them with {arcaneBarrage} and
              cast {touchOfTheMagi} while {arcaneBarrage} is in the air.
            </li>
            <li>
              Major Burn Phase: Ensure you have {siphonStorm} and {netherPrecision}. Your cast
              sequence would typically be{' '}
              <SpellSeq
                spells={[
                  TALENTS.EVOCATION_TALENT,
                  TALENTS.ARCANE_MISSILES_TALENT,
                  TALENTS.ARCANE_SURGE_TALENT,
                  SPELLS.ARCANE_BARRAGE,
                  TALENTS.TOUCH_OF_THE_MAGI_TALENT,
                ]}
              />
              . If you don't have 4 {arcaneCharge}s, cast {arcaneOrb} before {arcaneSurge}.
            </li>
            <li>
              Minor Burn Phase: {evocation} and {arcaneSurge} will not be available, but if possible
              you should go into {touchOfTheMagi} with {netherPrecision}.
            </li>
            <li>
              Use {presenceOfMind} at the end of {touchOfTheMagi} to squeeze in a couple more{' '}
              {arcaneBlast} casts.
            </li>
          </ul>
        </div>
      </>
    );
    const activeTimeTooltip = (
      <>
        {formatPercentage(this.touchOfTheMagi.averageActiveTime)}% average Active Time per Touch of
        the Magi cast.
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.activeTimeUtil), fontSize: '20px' }}
          >
            {touchOfTheMagiIcon}{' '}
            <TooltipElement content={activeTimeTooltip}>
              {formatPercentage(this.touchOfTheMagi.averageActiveTime)}%{' '}
              <small>Average Active Time</small>
            </TooltipElement>
          </div>
          <div>
            <strong>Touch of the Magi Usage</strong>
            <PerformanceBoxRow values={this.touchMagiData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div>
            <strong>Touch of the Magi Cast Efficiency</strong>
            <CastEfficiencyBar
              spellId={TALENTS.TOUCH_OF_THE_MAGI_TALENT.id}
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
      'Touch of the Magi',
    );
  }
}

export default TouchOfTheMagiGuide;
