import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

import FrozenOrb from '../talents/FrozenOrb';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

const AOE_THRESHOLD = 3;
const MAX_FINGERS_FROST_PROCS = 2;

class FrozenOrbGuide extends Analyzer {
  static dependencies = {
    frozenOrb: FrozenOrb,
  };

  protected frozenOrb!: FrozenOrb;

  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);

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
        {tooltipItems.map((t, i) => (
          <div key={i}>
            <PerformanceMark perf={t.perf} /> {t.detail}
            <br />
          </div>
        ))}
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
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      const targetsHit = fo.targetsHit;
      const ffstacks = fo.ffstacks;
      const ST = targetsHit < AOE_THRESHOLD;
      const AOE = targetsHit >= AOE_THRESHOLD;
      const whiffedOrb = targetsHit === 0;
      const cappedFingersST = ST && ffstacks === MAX_FINGERS_FROST_PROCS;
      const cappedFingersAOE = AOE && ffstacks === MAX_FINGERS_FROST_PROCS;

      if (whiffedOrb) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: 'No Targets Hit by Frozen Orb',
        });
      }

      if (cappedFingersST && !this.isSpellslinger) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: 'Capped on Fingers of Frost in Single Target/Cleave',
        });
      } else if (cappedFingersAOE || (cappedFingersST && this.isSpellslinger)) {
        tooltipItems.push({
          perf: QualitativePerformance.Ok,
          detail: 'Capped on Fingers of Frost in AOE',
        });
      }

      let overallPerf = QualitativePerformance.Good;
      if (whiffedOrb || (cappedFingersST && !this.isSpellslinger)) {
        overallPerf = QualitativePerformance.Fail;
      } else if (cappedFingersAOE || (cappedFingersST && this.isSpellslinger)) {
        overallPerf = QualitativePerformance.Ok;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, fo.cast.timestamp);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const frozenOrb = <SpellLink spell={TALENTS.FROZEN_ORB_TALENT} />;
    const fingersOfFrost = <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />;
    const freezingWinds = <SpellLink spell={TALENTS.FREEZING_WINDS_TALENT} />;
    const blizzard = <SpellLink spell={SPELLS.BLIZZARD} />;
    const iceCaller = <SpellLink spell={TALENTS.ICE_CALLER_TALENT} />;

    const frozenOrbIcon = <SpellIcon spell={TALENTS.FROZEN_ORB_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{frozenOrb}</b>'s primary purpose is to quickly generate {fingersOfFrost} procs,
          especially if you have {freezingWinds} talented. You should generally use this on
          cooldown, and use {blizzard} to reduce the cooldown on it if you have {iceCaller}{' '}
          talented. Use the below guidelines to get the most out of this cooldown.
          <ul>
            <li>Ensure you aim {frozenOrb} so that it does not completely miss all targets.</li>
            <li>
              In ST & Cleave, unless you are Spellslinger, don't use {frozenOrb} if you are capped
              on {fingersOfFrost}.
            </li>
          </ul>
        </div>
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
            <CastSummaryAndBreakdown
              spell={TALENTS.FROZEN_ORB_TALENT}
              castEntries={this.frozenOrbData}
            />
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
