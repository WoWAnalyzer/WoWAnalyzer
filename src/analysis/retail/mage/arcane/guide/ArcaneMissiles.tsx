import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ArcaneMissiles, { ArcaneMissilesCast } from '../core/ArcaneMissiles';
import { formatDurationMillisMinSec } from 'common/format';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import styled from '@emotion/styled';
import { qualitativePerformanceToColor } from 'interface/guide';

const CAST_BUFFER_MS = 750;
const GCD_DELAY_THRESHOLD = 300;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
`;

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

  private perCastBreakdown(cast: ArcaneMissilesCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const hasBuffAA = cast.aetherAttunement;
    const hasBuffNP = cast.netherPrecision;
    const capped = cast.clearcastingCapped;
    const clipped = cast.clipped;
    const clippedAtGCD =
      cast.channelEnd && cast.gcdEnd && cast.channelEnd - cast.gcdEnd < CAST_BUFFER_MS
        ? true
        : false;

    const missileTicks = {
      performance:
        !cast.clipped || (cast.clipped && clippedAtGCD)
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      summary: <>Missile Ticks</>,
      details: (
        <div>
          <TwoColumn>
            <div>Missile Ticks</div>
            {cast.ticks}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'missile-ticks',
      timestamp: cast.cast.timestamp,
      ...missileTicks,
    });

    const channelClipped = {
      performance:
        (!cast.clipped && hasBuffAA) || (cast.clipped && clippedAtGCD && !hasBuffAA)
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      summary: <>Channel Clipped</>,
      details: (
        <div>
          <TwoColumn>
            <div>
              <>Channel Clipped</>
            </div>
            {cast.clipped ? `Yes` : `No`}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'channel-clipped',
      timestamp: cast.cast.timestamp,
      ...channelClipped,
    });

    if (cast.clipped && cast.gcdEnd && cast.channelEnd) {
      const beforeGCDDelay =
        cast.channelEnd && cast.gcdEnd && cast.gcdEnd > cast.channelEnd
          ? cast.gcdEnd - cast.channelEnd
          : undefined;
      const afterGCDDelay =
        cast.channelEnd && cast.gcdEnd && cast.channelEnd > cast.gcdEnd
          ? cast.channelEnd - cast.gcdEnd
          : undefined;
      const afterGCDPerf =
        afterGCDDelay && afterGCDDelay < GCD_DELAY_THRESHOLD
          ? QualitativePerformance.Good
          : QualitativePerformance.Ok;
      const clippedBeforeGCD = {
        performance: clippedAtGCD && afterGCDDelay ? afterGCDPerf : QualitativePerformance.Fail,
        summary: <>Channel Clipped Before GCD</>,
        details: (
          <div>
            <TwoColumn>
              <div>Channel Clipped Before GCD</div>
              {clippedAtGCD
                ? `Yes (${afterGCDDelay?.toFixed(0)}ms After)`
                : `No (${beforeGCDDelay?.toFixed(0)}ms Before)`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'clipped-before-gcd',
        timestamp: cast.cast.timestamp,
        ...clippedBeforeGCD,
      });
    }

    const clearcastingCapped = {
      performance:
        (hasBuffNP && capped) || (!hasBuffNP && !capped)
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      summary: <>Clearcasting Capped</>,
      details: (
        <div>
          <TwoColumn>
            <div>Clearcasting Capped</div>
            {cast.clearcastingCapped
              ? `Yes (${cast.clearcastingProcs})`
              : `No (${cast.clearcastingProcs})`}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'clearcasting-capped',
      timestamp: cast.cast.timestamp,
      ...clearcastingCapped,
    });

    if (this.hasNetherPrecision) {
      const netherPrecisionBuff = {
        performance:
          (hasBuffNP && capped) || (!hasBuffNP && !capped)
            ? QualitativePerformance.Good
            : QualitativePerformance.Fail,
        summary: <>Nether Precision Buff</>,
        details: (
          <div>
            <TwoColumn>
              <div>Nether Precision Buff</div>
              {cast.netherPrecision ? `Buff Active` : `Buff Missing`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'nether-precision-buff',
        timestamp: cast.cast.timestamp,
        ...netherPrecisionBuff,
      });
    }

    if (this.hasAetherAttunement) {
      const aetherAttunementBuff = {
        performance:
          (hasBuffAA && !clipped) || (!hasBuffAA && clipped)
            ? QualitativePerformance.Good
            : QualitativePerformance.Fail,
        summary: <>Aether Attunement Buff</>,
        details: (
          <div>
            <TwoColumn>
              <div>Aether Attunement Buff</div>
              {cast.aetherAttunement ? `Buff Active` : `Buff Missing`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'nether-precision-buff',
        timestamp: cast.cast.timestamp,
        ...aetherAttunementBuff,
      });
    }

    const nextCastDelay = {
      performance:
        cast.channelEndDelay !== undefined
          ? this.channelDelayUtil(cast.channelEndDelay)
          : QualitativePerformance.Fail,
      summary: <>Delay before Next Cast</>,
      details: (
        <div>
          <TwoColumn>
            <div>Delay before Next Cast</div>
            {cast.channelEndDelay !== undefined
              ? `${formatDurationMillisMinSec(cast.channelEndDelay, 3)}`
              : `Not Found`}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'next-cast-delay',
      timestamp: cast.cast.timestamp,
      ...nextCastDelay,
    });

    const npBuffCheck = !capped && !hasBuffNP;
    const aaBuffCheck = (!clipped && hasBuffAA) || (clipped && !hasBuffAA);

    let overallPerf = QualitativePerformance.Fail;
    if (npBuffCheck && aaBuffCheck) {
      overallPerf = QualitativePerformance.Good;
    } else if (npBuffCheck && !clipped && !hasBuffAA) {
      overallPerf = QualitativePerformance.Ok;
    }

    return {
      event: cast.cast,
      performance: overallPerf,
      checklistItems: checklistItems,
      performanceExplanation:
        overallPerf !== QualitativePerformance.Fail ? `${overallPerf} Usage` : 'Bad Usage',
    };
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
              other rules to avoid munching a proc (gaining a proc when already capped).
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
        {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3)} Average Delay from
        End Channel to Next Cast.
      </>
    );
    const uses = this.arcaneMissiles.missileCasts.map((cast) => this.perCastBreakdown(cast));
    const goodCasts = uses.filter((it) => it.performance === QualitativePerformance.Good).length;
    const totalCasts = uses.length;
    return (
      <div>
        <ContextualSpellUsageSubSection
          title="Arcane Missiles"
          explanation={explanation}
          uses={uses}
          castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
          wideExplanation
          onPerformanceBoxClick={logSpellUseEvent}
          abovePerformanceDetails={
            <div style={{ marginBottom: 10 }}>
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
              <br />
              <CastPerformanceSummary
                spell={TALENTS.ARCANE_MISSILES_TALENT}
                casts={goodCasts}
                performance={QualitativePerformance.Good}
                totalCasts={totalCasts}
              />
            </div>
          }
        />
      </div>
    );
  }
}

export default ArcaneMissilesGuide;
