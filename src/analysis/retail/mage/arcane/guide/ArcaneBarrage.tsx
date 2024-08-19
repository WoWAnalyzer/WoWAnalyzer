import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ArcaneBarrage, { ArcaneBarrageCast } from '../core/ArcaneBarrage';
import { ARCANE_CHARGE_MAX_STACKS } from '../../shared';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import styled from '@emotion/styled';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';

const AOE_THRESHOLD = 4;
const TEMPO_REMAINING_THRESHOLD = 5000;
const NETHER_STACK_THRESHOLD = 1;
const TOUCH_CD_THRESHOLD = 6000;
const EVOCATION_CD_THRESHOLD = 45000;
const LOW_MANA_THRESHOLD = 0.7;
const NO_MANA_THRESHOLD = 0.1;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
`;

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  hasArcaneTempo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);
  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
  hasEvocation: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  private perCastBreakdown(cast: ArcaneBarrageCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const ST = cast.targetsHit < AOE_THRESHOLD;
    const AOE = cast.targetsHit >= AOE_THRESHOLD;
    const maxCharges = cast.charges >= ARCANE_CHARGE_MAX_STACKS;
    const tempoExpiring =
      cast.tempoRemaining &&
      cast.tempoRemaining < TEMPO_REMAINING_THRESHOLD &&
      cast.tempoRemaining !== 0;
    const touchNotSoon = cast.touchCD && cast.touchCD > TOUCH_CD_THRESHOLD;
    const lowMana = cast.mana && cast.mana < LOW_MANA_THRESHOLD;
    const noMana = cast.mana && cast.mana < NO_MANA_THRESHOLD;
    const evocationNotSoon = cast.evocationCD && cast.evocationCD > EVOCATION_CD_THRESHOLD;
    const oneNPStack = cast.netherPrecisionStacks === NETHER_STACK_THRESHOLD;
    const arcaneOrbAvail = cast.arcaneOrbAvail;
    const clearcastingAvail = cast.clearcasting;

    const barrageCharges = {
      performance:
        (ST && lowMana) || (AOE && maxCharges)
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      summary: <>Arcane Charges Before Barrage</>,
      details: (
        <div>
          <TwoColumn>
            <div>Arcane Charges Before Barrage</div>
            {cast.charges}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'barrage-charges',
      timestamp: cast.cast.timestamp,
      ...barrageCharges,
    });

    const barrageMana = {
      performance:
        (ST && lowMana) || (AOE && maxCharges) || noMana
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      summary: <>Mana Percent</>,
      details: (
        <div>
          <TwoColumn>
            <div>Mana Percent</div>
            {formatPercentage(cast.mana || 0, 2)}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'barrage-mana',
      timestamp: cast.cast.timestamp,
      ...barrageMana,
    });

    const barrageTargetsHit = {
      performance: cast.targetsHit > 0 ? QualitativePerformance.Good : QualitativePerformance.Fail,
      summary: <>Targets Hit</>,
      details: (
        <div>
          <TwoColumn>
            <div>Targets Hit</div>
            {cast.targetsHit}
          </TwoColumn>
        </div>
      ),
    };
    checklistItems.push({
      check: 'barrage-targets-hit',
      timestamp: cast.cast.timestamp,
      ...barrageTargetsHit,
    });

    if (this.hasArcaneTempo) {
      const arcaneTempoRemaining = {
        performance: tempoExpiring ? QualitativePerformance.Good : QualitativePerformance.Ok,
        summary: <>Time Until Arcane Tempo Expires</>,
        details: (
          <div>
            <TwoColumn>
              <div>Time Until Arcane Tempo Expires</div>
              {cast.tempoRemaining
                ? formatDurationMillisMinSec(cast.tempoRemaining, 3)
                : `Buff Missing`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'arcane-tempo-remaining',
        timestamp: cast.cast.timestamp,
        ...arcaneTempoRemaining,
      });
    }

    if (this.hasTouchOfTheMagi) {
      const touchCooldown = {
        performance: touchNotSoon ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <>Touch of the Magi CD Remaining</>,
        details: (
          <div>
            <TwoColumn>
              <div>Touch of the Magi CD Remaining</div>
              {cast.touchCD && cast.touchCD > 0
                ? formatDurationMillisMinSec(cast.touchCD)
                : `Available`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'touch-cooldown',
        timestamp: cast.cast.timestamp,
        ...touchCooldown,
      });
    }

    if (this.hasEvocation) {
      const evocationCooldown = {
        performance: evocationNotSoon ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <>Evocation CD Remaining</>,
        details: (
          <div>
            <TwoColumn>
              <div>Evocation CD Remaining</div>
              {cast.evocationCD && cast.evocationCD > 0
                ? formatDurationMillisMinSec(cast.evocationCD)
                : `Available`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'evocation-cooldown',
        timestamp: cast.cast.timestamp,
        ...evocationCooldown,
      });
    }

    if (this.hasNetherPrecision) {
      const netherPrecisionStacks = {
        performance:
          oneNPStack || !cast.netherPrecisionStacks
            ? QualitativePerformance.Good
            : QualitativePerformance.Fail,
        summary: <>Nether Precision Stacks</>,
        details: (
          <div>
            <TwoColumn>
              <div>Nether Precision Stacks</div>
              {cast.netherPrecisionStacks ? cast.netherPrecisionStacks : `Buff Missing`}
            </TwoColumn>
          </div>
        ),
      };
      checklistItems.push({
        check: 'nether-precision-stacks',
        timestamp: cast.cast.timestamp,
        ...netherPrecisionStacks,
      });
    }

    const overallPerf =
      tempoExpiring ||
      (ST && lowMana && touchNotSoon && evocationNotSoon) ||
      (ST && maxCharges && oneNPStack && (arcaneOrbAvail || clearcastingAvail)) ||
      (ST && noMana) ||
      (AOE && maxCharges)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    return {
      event: cast.cast,
      performance: overallPerf,
      checklistItems: checklistItems,
      performanceExplanation:
        overallPerf !== QualitativePerformance.Fail ? `${overallPerf} Usage` : 'Bad Usage',
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;

    const explanation = (
      <>
        <div>
          Casting <b>{arcaneBarrage}</b> spends your {arcaneCharge}s, removing the increased damage
          and mana cost of your arcane spells. Since clearing {arcaneCharge} reduces your damage,
          refer to the below rules for when you should cast {arcaneBarrage}:
        </div>
        <div>
          <ul>
            <li>
              If {arcaneTempo} is about to expire, cast {arcaneBarrage} to refresh the buff.
            </li>
            <li>
              Do not cast {arcaneBarrage} if {touchOfTheMagi} is less than 5-6 seconds away.
            </li>
            <li>
              On Single Target: Cast {arcaneBarrage} if below 70% mana and {evocation} is more than
              45s away.
            </li>
            <li>
              If all of the following are true, start casting {arcaneBlast} and queue up an{' '}
              {arcaneBarrage} at the very end of the {arcaneBlast} cast:
            </li>
            <ul>
              <li>You have 4 {arcaneCharge}s</li>
              <li>1 stack of {netherPrecision}</li>
              <li>
                Either a {clearcasting} proc or a charge of {arcaneOrb}
              </li>
            </ul>
            <li>If you run out of mana, cast {arcaneBarrage}</li>
          </ul>
        </div>
      </>
    );
    const uses = this.arcaneBarrage.barrageCasts.map((cast) => this.perCastBreakdown(cast));
    const goodCasts = uses.filter((it) => it.performance === QualitativePerformance.Good).length;
    const totalCasts = uses.length;
    return (
      <div>
        <ContextualSpellUsageSubSection
          title="Arcane Barrage"
          explanation={explanation}
          uses={uses}
          castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
          wideExplanation
          onPerformanceBoxClick={logSpellUseEvent}
          abovePerformanceDetails={
            <div style={{ marginBottom: 10 }}>
              <CastPerformanceSummary
                spell={SPELLS.ARCANE_BARRAGE}
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

export default ArcaneBarrageGuide;
