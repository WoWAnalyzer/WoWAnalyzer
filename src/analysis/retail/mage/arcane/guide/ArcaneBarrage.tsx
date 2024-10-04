import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ArcaneBarrage from '../core/ArcaneBarrage';
import { ARCANE_CHARGE_MAX_STACKS } from '../../shared';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerformanceMark } from 'interface/guide';
import GloriousIncandescence from '../../shared/GloriousIncandescense';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../Guide';

const TEMPO_REMAINING_THRESHOLD = 5000;
const TOUCH_CD_THRESHOLD = 6000;
const NO_MANA_THRESHOLD = 0.1;

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
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

  get arcaneBarrageData() {
    const data: BoxRowEntry[] = [];
    this.arcaneBarrage.barrageCasts.forEach((ab) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      const lowCharges = ab.charges < ARCANE_CHARGE_MAX_STACKS;
      if (lowCharges) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Low Arcane Charges (${ab.charges})`,
        });
      }

      const noMana = ab.mana && ab.mana < NO_MANA_THRESHOLD;
      if (ab.mana && noMana) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Barrage with Low Mana (${formatPercentage(ab.mana, 2)}%)`,
        });
      }

      if (ab.arcaneSoul) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Had Arcane Soul` });
      }

      const touchSoon = ab.touchCD < TOUCH_CD_THRESHOLD;
      if (touchSoon) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Touch of the Magi Almost Available`,
        });
      }

      const standardChecks = !lowCharges && !noMana && !touchSoon && !ab.arcaneSoul;
      const extraBuffs = ab.burdenOfPower || ab.gloriousIncandescence || ab.intuition;
      if (this.isSunfury && standardChecks && !extraBuffs) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Missing Supporting Buff (Burden, Incandescence, Intuition)`,
        });
      }

      const badBlastWithNP =
        (ab.blastPrecast && ab.netherPrecisionStacks !== 1 && extraBuffs) ||
        (ab.blastPrecast && ab.netherPrecisionStacks === 1 && !extraBuffs);
      if (this.isSunfury && standardChecks && badBlastWithNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Blast cast ${extraBuffs ? 'with' : 'without'} Supporting Buff and ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      const badNoBlastWithNP =
        (!ab.blastPrecast && ab.netherPrecisionStacks !== 2 && extraBuffs) ||
        (!ab.blastPrecast && ab.netherPrecisionStacks === 2 && !extraBuffs);
      if (this.isSunfury && standardChecks && badNoBlastWithNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `No Blast cast ${extraBuffs ? 'with' : 'without'} Supporting Buff and ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      const badNoBlastWithoutNP = !ab.blastPrecast && !ab.netherPrecisionStacks && !ab.clearcasting;
      if (this.isSunfury && standardChecks && badNoBlastWithoutNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `No Blast without NP/CC without Supporting Buff`,
        });
      }

      const tempoExpiring = ab.tempoRemaining && ab.tempoRemaining < TEMPO_REMAINING_THRESHOLD;
      if (this.isSpellslinger && standardChecks && tempoExpiring) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Arcane Tempo Expiring` });
      }

      const blastWithOneNP = ab.blastPrecast && ab.netherPrecisionStacks === 1;
      if (this.isSpellslinger && standardChecks && !tempoExpiring && !blastWithOneNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `${ab.blastPrecast ? '' : 'No '}Blast Cast with ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (
        !standardChecks ||
        (this.isSunfury && (badBlastWithNP || badNoBlastWithNP || badNoBlastWithoutNP)) ||
        (this.isSpellslinger && blastWithOneNP)
      ) {
        overallPerf = QualitativePerformance.Fail;
      } else {
        overallPerf = QualitativePerformance.Good;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, ab.cast.timestamp);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const burdenOfPower = <SpellLink spell={TALENTS.BURDEN_OF_POWER_TALENT} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;
    const intuition = <SpellLink spell={SPELLS.INTUITION_BUFF} />;

    const explanation = (
      <>
        <div>
          Casting <b>{arcaneBarrage}</b> spends your {arcaneCharge}s and the associated damage and
          mana cost increase. Since clearing {arcaneCharge} reduces your damage, refer to the below
          for when to cast {arcaneBarrage}:
        </div>
        <div>
          <ul>
            <li>
              Cast {arcaneBarrage} if you have 4 {arcaneCharge}s and {arcaneSoul}, {touchOfTheMagi}{' '}
              is about to be available, or one of the below are true:
            </li>
            {this.isSunfury && (
              <>
                <li>
                  You are casting {arcaneBlast}, have 1 stack of {netherPrecision}, and{' '}
                  {burdenOfPower}, {gloriousIncandescence}, or {intuition}.
                </li>
                <li>
                  You are NOT casting {arcaneBlast}, have 2 stacks of {netherPrecision}, and{' '}
                  {burdenOfPower}, {GloriousIncandescence}, or {intuition}.
                </li>
                <li>
                  You are NOT casting {arcaneBlast}, do not have {netherPrecision} or {clearcasting}
                  , and have {burdenOfPower}, {gloriousIncandescence}, or {intuition}.
                </li>
              </>
            )}
            {this.isSpellslinger && (
              <>
                <li>{arcaneTempo} is about to expire</li>
                <li>You have 1 stack of {netherPrecision}</li>
              </>
            )}
          </ul>
        </div>
      </>
    );
    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={SPELLS.ARCANE_BARRAGE}
          castEntries={this.arcaneBarrageData}
        />
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Barrage',
    );
  }
}

export default ArcaneBarrageGuide;
