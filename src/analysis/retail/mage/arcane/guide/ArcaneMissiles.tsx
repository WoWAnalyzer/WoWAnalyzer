import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ArcaneMissiles from '../core/ArcaneMissiles';
import { formatDurationMillisMinSec } from 'common/format';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../Guide';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

const MISSILE_LATE_CLIP_DELAY = 500;
const MISSILE_EARLY_CLIP_DELAY = 200;

class ArcaneMissilesGuide extends Analyzer {
  static dependencies = {
    arcaneMissiles: ArcaneMissiles,
  };

  protected arcaneMissiles!: ArcaneMissiles;

  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);

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

  channelDelayUtil(delay: number) {
    const thresholds = this.arcaneMissiles.channelDelayThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (delay < thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (delay < thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (delay < thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get arcaneMissilesData() {
    const data: BoxRowEntry[] = [];
    this.arcaneMissiles.missileCasts.forEach((am) => {
      const clippedAtGCD =
        am.channelEnd && am.gcdEnd && am.channelEnd - am.gcdEnd < MISSILE_LATE_CLIP_DELAY
          ? true
          : false;
      const clippedBeforeGCD =
        am.channelEnd && am.gcdEnd && am.gcdEnd - am.channelEnd > MISSILE_EARLY_CLIP_DELAY
          ? true
          : false;
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      if (am.clearcastingCapped) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: 'Capped on Clearcasting Charges',
        });
      }

      const hadBuffNP = this.hasNetherPrecision && am.netherPrecision;
      if (hadBuffNP && !am.clearcastingCapped) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: 'Nether Precision Buff Active',
        });
      }

      const badClip = am.clipped && clippedBeforeGCD;
      if (badClip) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Clipped Missiles Before GCD`,
        });
      }

      const noClip = !am.aetherAttunement && !am.clipped;
      if (noClip) {
        tooltipItems.push({
          perf: QualitativePerformance.Ok,
          detail: `Full Channeled without Aether Attunement`,
        });
      }

      const goodClip = !am.aetherAttunement && am.clipped && clippedAtGCD;
      if (goodClip) {
        tooltipItems.push({
          perf: QualitativePerformance.Perfect,
          detail: `Clipped at GCD With Aether Attunement`,
        });
      }

      if (am.channelEndDelay) {
        tooltipItems.push({
          perf: this.channelDelayUtil(am.channelEndDelay),
          detail: `Delay Until Next Cast (${formatDurationMillisMinSec(am.channelEndDelay, 3)}s)`,
        });
      } else {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: 'Next Cast Not Found' });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (hadBuffNP && !am.clearcastingCapped) {
        overallPerf = QualitativePerformance.Fail;
      } else if (noClip) {
        overallPerf = QualitativePerformance.Ok;
      } else if (goodClip && (!hadBuffNP || am.clearcastingCapped)) {
        overallPerf = QualitativePerformance.Perfect;
      } else if (!hadBuffNP || (hadBuffNP && am.clearcastingCapped)) {
        overallPerf = QualitativePerformance.Good;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, am.cast.timestamp);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const aetherAttunement = <SpellLink spell={TALENTS.AETHER_ATTUNEMENT_TALENT} />;
    const highVoltage = <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} />;
    const arcaneMissilesIcon = <SpellIcon spell={TALENTS.ARCANE_MISSILES_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneMissiles}</b> primarily is your {clearcasting} spender but also increases damage
          via procs such as {netherPrecision}, {aetherAttunement}, and {highVoltage}. Refer to these
          guidelines to take advantage of these procs without conflicting with your other procs and
          buffs.
          <ul>
            <li>
              If capped on {clearcasting} charges, cast {arcaneMissiles} immediately, regardless of
              any of the below items, to avoid munching procs (gaining a charge when capped).
            </li>
            <li>
              Do not cast {arcaneMissiles} if you have {netherPrecision}.
            </li>
            <li>
              If you have {aetherAttunement} fully channel {arcaneMissiles}. If you don't, then you
              can optionally cancel your channel immediately after the GCD ends.
            </li>
          </ul>
        </div>
      </>
    );
    const averageDelayTooltip = (
      <>
        {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3)} Average Delay from
        End Channel to Next Cast.
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(
                this.channelDelayUtil(this.arcaneMissiles.averageChannelDelay),
              ),
              fontSize: '20px',
            }}
          >
            {arcaneMissilesIcon}{' '}
            <TooltipElement content={averageDelayTooltip}>
              {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3)}{' '}
              <small>Average Delay from Channel End to Next Cast</small>
            </TooltipElement>
          </div>
          <div>
            <CastSummaryAndBreakdown
              spell={TALENTS.ARCANE_MISSILES_TALENT}
              castEntries={this.arcaneMissilesData}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Missiles',
    );
  }
}

export default ArcaneMissilesGuide;
