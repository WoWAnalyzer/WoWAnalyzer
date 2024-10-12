import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ArcaneBarrage from '../core/ArcaneBarrage';
import { ARCANE_CHARGE_MAX_STACKS } from '../../shared';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerformanceMark } from 'interface/guide';
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
        (ab.blastPrecast &&
          ab.netherPrecisionStacks &&
          ab.netherPrecisionStacks !== 1 &&
          extraBuffs) ||
        (ab.blastPrecast && ab.netherPrecisionStacks === 1 && !extraBuffs);
      if (this.isSunfury && standardChecks && badBlastWithNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Blast cast ${extraBuffs ? 'with' : 'without'} Supporting Buff and ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      const badNoBlastWithTwoNP =
        !ab.blastPrecast &&
        ab.netherPrecisionStacks &&
        ab.netherPrecisionStacks !== 2 &&
        extraBuffs;
      const noBlastWithOneNP = !ab.blastPrecast && ab.netherPrecisionStacks === 1 && extraBuffs;
      if (this.isSunfury && standardChecks && (badNoBlastWithTwoNP || noBlastWithOneNP)) {
        tooltipItems.push({
          perf: noBlastWithOneNP ? QualitativePerformance.Ok : QualitativePerformance.Fail,
          detail: `No Blast cast ${extraBuffs ? 'with' : 'without'} Supporting Buff and ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      const badWithoutNPCC = !ab.netherPrecisionStacks && !ab.clearcasting && !extraBuffs;
      if (this.isSunfury && standardChecks && badWithoutNPCC) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `No NP or CC without Supporting Buff`,
        });
      }

      const tempoNotExpiring = ab.tempoRemaining && ab.tempoRemaining > TEMPO_REMAINING_THRESHOLD;
      if (this.isSpellslinger && standardChecks && !tempoNotExpiring) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Arcane Tempo Expiring` });
      }

      if (this.isSpellslinger && standardChecks && tempoNotExpiring) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Arcane Tempo ${ab.tempoRemaining ? <>Duration Remaining: {formatDurationMillisMinSec(ab.tempoRemaining, 3)}s</> : 'Not Active'}`,
        });
      }

      const blastWithOneNP = ab.blastPrecast && ab.netherPrecisionStacks === 1;
      if (this.isSpellslinger && standardChecks && !blastWithOneNP) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `${ab.blastPrecast ? '' : 'No '}Blast Cast with ${ab.netherPrecisionStacks} NP stack(s)`,
        });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (
        (!ab.arcaneSoul &&
          !touchSoon &&
          !noMana &&
          !lowCharges &&
          this.isSunfury &&
          standardChecks &&
          (badBlastWithNP || (badNoBlastWithTwoNP && !noBlastWithOneNP) || badWithoutNPCC)) ||
        (this.isSpellslinger &&
          standardChecks &&
          (!ab.tempoRemaining || !tempoNotExpiring || blastWithOneNP))
      ) {
        overallPerf = QualitativePerformance.Fail;
      } else if (!ab.arcaneSoul && !touchSoon && !noMana && !lowCharges && noBlastWithOneNP) {
        overallPerf = QualitativePerformance.Ok;
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
          <b>{arcaneBarrage}</b> spends your {arcaneCharge}s and removes the associated damage and
          mana cost increases, reducing your damage. So you should stay at 4 {arcaneCharge}s as much
          as you can, only casting {arcaneBarrage} with 4 {arcaneCharge}s and only under the
          following conditions.
        </div>
        <div>
          <ul>
            <li>
              {touchOfTheMagi} is almost available
              {this.isSunfury ? <>, you have {arcaneSoul},</> : ''} or you're out of mana.
            </li>
            {this.isSunfury && (
              <>
                <li>
                  One of the below is true and you have {burdenOfPower}, {gloriousIncandescence}, or{' '}
                  {intuition}
                </li>
                <ul>
                  <li>
                    You are casting {arcaneBlast} with 1 stack of {netherPrecision}.
                  </li>
                  <li>
                    You are NOT casting {arcaneBlast} have 2 stacks of {netherPrecision}.
                  </li>
                  <li>
                    You do not have {netherPrecision} or {clearcasting}.
                  </li>
                </ul>
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
