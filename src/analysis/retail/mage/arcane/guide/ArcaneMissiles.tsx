import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark, qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import ArcaneMissiles, { ArcaneMissilesCast } from '../core/ArcaneMissiles';
import { formatDurationMillisMinSec } from 'common/format';

const CAST_BUFFER_MS = 750;

class ArcaneMissilesGuide extends Analyzer {
  static dependencies = {
    arcaneMissiles: ArcaneMissiles,
  };

  protected arcaneMissiles!: ArcaneMissiles;

  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);

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

  private perCastBreakdown(cast: ArcaneMissilesCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.cast.timestamp)} &mdash;{' '}
        <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    checklistItems.push({
      label: <>Missile Ticks</>,
      details: <>{cast.ticks}</>,
    });

    checklistItems.push({
      label: <>Channel Clipped</>,
      details: <>{cast.clipped ? `Yes` : `No`}</>,
    });

    if (cast.clipped && cast.gcdEnd && cast.channelEnd) {
      const clippedBeforeGCD = cast.gcdEnd > cast.channelEnd;
      checklistItems.push({
        label: <>Channel Clipped Before/After GCD</>,
        result: <PassFailCheckmark pass={!clippedBeforeGCD} />,
        details: <>{clippedBeforeGCD ? `Before` : `After`}</>,
      });

      checklistItems.push({
        label: <>Delay Since GCD Ended</>,
        details: (
          <>
            {cast.channelEnd > cast.gcdEnd
              ? `${(cast.channelEnd - cast.gcdEnd).toFixed(0)}ms`
              : `${(cast.gcdEnd - cast.channelEnd).toFixed(0)}ms`}
          </>
        ),
      });
    }

    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> Capped
        </>
      ),
      details: (
        <>
          {cast.clearcastingCapped
            ? `Yes (${cast.clearcastingProcs})`
            : `No (${cast.clearcastingProcs})`}
        </>
      ),
    });

    checklistItems.push({
      label: <>Delay before next cast</>,
      result: (
        <PerformanceMark
          perf={
            cast.channelEndDelay !== undefined
              ? this.channelDelayUtil(cast.channelEndDelay)
              : QualitativePerformance.Fail
          }
        />
      ),
      details: (
        <>
          {cast.channelEndDelay !== undefined
            ? `${cast.channelEndDelay.toFixed(0)} ms`
            : `Not Found`}
        </>
      ),
    });

    if (this.hasNetherPrecision) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} /> Buff
          </>
        ),
        details: <>{cast.netherPrecision ? `Active` : `Missing`}</>,
      });
    }

    if (this.hasAetherAttunement) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.AETHER_ATTUNEMENT_TALENT} /> Buff
          </>
        ),
        details: <>{cast.aetherAttunement ? `Active` : `Missing`}</>,
      });
    }

    const hasBuffAA = cast.aetherAttunement;
    const hasBuffNP = cast.netherPrecision;
    const capped = cast.clearcastingCapped;
    const clipped = cast.clipped;
    const clippedAtGCD =
      cast.channelEnd && cast.gcdEnd && cast.channelEnd - cast.gcdEnd < CAST_BUFFER_MS
        ? true
        : false;

    const overallPerf =
      capped ||
      (!capped && !hasBuffNP) ||
      (clipped && !hasBuffAA && clippedAtGCD) ||
      (!clipped && hasBuffAA)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        perf={overallPerf}
        key={cast.ordinal}
      />
    );
  }

  get guideSubsection(): JSX.Element {
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const aetherAttunement = <SpellLink spell={TALENTS.AETHER_ATTUNEMENT_TALENT} />;
    const highVoltage = <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} />;
    const arcaneHarmony = <SpellLink spell={TALENTS.ARCANE_HARMONY_TALENT} />;
    const arcaneMissilesIcon = <SpellIcon spell={TALENTS.ARCANE_MISSILES_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneMissiles}</b>'s primary function is as a spender for {clearcasting}, however it
          also increases your damage in other ways via procs such as {netherPrecision},{' '}
          {aetherAttunement},{highVoltage}, and {arcaneHarmony} to name a few. As a result, you
          should ensure that you take advantage of these benefits and also ensure that{' '}
          {arcaneMissiles} is not conflicting with your other procs and abilities.
          <ul>
            <li>
              If you are capped on {clearcasting} charges, cast {arcaneMissiles} regardless of any
              other rules to avoid munching a proc (gaining, and losing, a charge when you are
              already capped).
            </li>
            <li>
              Do not cast {arcaneMissiles} if you have {netherPrecision}.
            </li>
            <li>
              If you do not have {aetherAttunement}, cancel your {arcaneMissiles} channel once the
              GCD ends.
            </li>
            <li>
              If you do have {aetherAttunement}, channel {arcaneMissiles} for the full duration.
            </li>
          </ul>
        </div>
      </>
    );
    const averageDelayTooltip = (
      <>
        {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay)} Average Delay from End
        Channel to Next Cast.
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
              {this.arcaneMissiles.averageChannelDelay.toFixed(0)}ms{' '}
              <small>Average Delay from Channel End to Next Cast</small>
            </TooltipElement>
          </div>
          <div>
            <p>
              <strong>Per-Cast Breakdown</strong>
              <small> - click to expand</small>
              {this.arcaneMissiles.missileCasts.map((cast) => this.perCastBreakdown(cast))}
            </p>
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
