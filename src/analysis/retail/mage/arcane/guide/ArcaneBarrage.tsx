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
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../Guide';

const TEMPO_REMAINING_THRESHOLD = 2000;
const TOUCH_CD_THRESHOLD = 6000;
const NO_MANA_THRESHOLD = 0.1;
const LOW_MANA_THRESHOLD = 0.7;
const EXECUTE_HEALTH_PERCENT = 0.35;
const AETHERVISION_STACK_THRESHOLD = 2;

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

      const touchSoon = ab.touchCD < TOUCH_CD_THRESHOLD;

      const lowCharges = ab.charges < ARCANE_CHARGE_MAX_STACKS;
      if (lowCharges) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Low Arcane Charges (${ab.charges})`,
        });
      }

      if(!ab.netherPrecisionStacks && ab.clearcasting){
        tooltipItems.push({
          perf: QualitativePerformance.Ok,
          detail: `No Netherprecision stacks even though clearcasting was available `,
        });
      }

            if(ab.netherPrecisionStacks ){
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Had Netherprecision`,
        });
      }

      if (ab.arcaneSoul) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Had Arcane Soul` });
      }

      if ((ab.gloriousIncandescence || (ab.burdenOfPower && ab.blastPrecast)) && !touchSoon) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Had Glorious Incandescence`,
        });
      }

      if (ab.intuition) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Had Intuition` });
      }

      const noMana = ab.mana && ab.mana < NO_MANA_THRESHOLD;
      if (ab.mana && noMana) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Barrage with No Mana (${formatPercentage(ab.mana, 2)}%)`,
        });
      }

      const lowMana = ab.mana && ab.mana < LOW_MANA_THRESHOLD;
      if (this.isSpellslinger && (ab.intuition) && lowMana) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Below 70% Mana` });
      }

      const lowHealth = ab.health && ab.health < EXECUTE_HEALTH_PERCENT;
      if (this.isSpellslinger && (ab.intuition) && lowHealth) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Target Below 35% Health` });
      }

      if (ab.nextCastIsTouch) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Touch of the magi after`,
        });
      }

      const tempoExpiring = ab.tempoRemaining && ab.tempoRemaining <= TEMPO_REMAINING_THRESHOLD;
      if (tempoExpiring) {
        tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Arcane Tempo Expiring` });
      }

      const hasOrbWithCharges = ab.arcaneOrb && !lowCharges;
      if (this.isSpellslinger) {
        if ((ab.intuition ) && ab.netherPrecisionStacks) {
          tooltipItems.push({ perf: QualitativePerformance.Good, detail: `Had Nether Precision` });
        } else if ((ab.intuition ) && !ab.clearcasting) {
          tooltipItems.push({
            perf: QualitativePerformance.Good,
            detail: `Didn't Have Clearcasting`,
          });
        } else if (!ab.netherPrecisionStacks && !ab.clearcasting && hasOrbWithCharges) {
          tooltipItems.push({
            perf: QualitativePerformance.Good,
            detail: `Had Arcane Orb without Nether Precision or Clearcasting`,
          });
        }
      } 

      let overallPerf = QualitativePerformance.Fail;
      if (
        this.isSunfury &&
        (ab.netherPrecisionStacks || !ab.clearcasting) &&
        (ab.gloriousIncandescence || (ab.blastPrecast && ab.burdenOfPower) ||
          (ab.intuition) || ab.nextCastIsTouch || ab.arcaneSoul || tempoExpiring )
      ) {
        overallPerf = QualitativePerformance.Perfect;
      } else if (
        this.isSpellslinger &&
        (tempoExpiring ||
          ((ab.intuition ) &&
            (ab.netherPrecisionStacks || !ab.clearcasting)) ||
          (!ab.netherPrecisionStacks && !ab.clearcasting && ab.arcaneOrb && !lowCharges))
      ) {
        overallPerf = QualitativePerformance.Perfect;
      } else if (noMana) {
        overallPerf = QualitativePerformance.Good;
      } else if (
        this.isSunfury &&
        (ab.arcaneSoul || ab.gloriousIncandescence || ab.intuition )
      ) {
        overallPerf = QualitativePerformance.Good;
      } else if (this.isSpellslinger && (ab.intuition )) {
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
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;
    const aethervision = <SpellLink spell={SPELLS.AETHERVISION_BUFF} />;
    const intuition = <SpellLink spell={SPELLS.INTUITION_BUFF} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneBarrage}</b> is your {arcaneCharge} spender, removing the associated increased
          mana costs and damage. Only cast {arcaneBarrage} under one of the below conditions to
          maintain the damage increase for as long as possible.
        </div>
        <div>
          <ul>
            <li>{touchOfTheMagi} is available and you're going to cast it while the barrage is in the air.</li>
            {this.isSunfury && (
              <li>
                You have {arcaneSoul} or {intuition}.
              </li>
            )}
                        {this.isSunfury && (
              <li>
                You have {gloriousIncandescence} and {touchOfTheMagi} has more than 6 seconds left on cd.
              </li>
            )}
            {this.isSpellslinger && (
              <li>
                You have {intuition} or two stacks of {aethervision}.
              </li>
            )}
            <li>{arcaneTempo} is about to expire</li>
          </ul>
        </div>
        {this.isSpellslinger && (
          <div>
            Additionally, you can include these more advanced conditions for a small damage boost:
            <ul>
              <li>{arcaneTempo} is about to expire.</li>
              <li>
                You have {intuition} or two stacks of {aethervision}, and also have{' '}
                {netherPrecision} or don't have {clearcasting}.
              </li>
              <li>
                You don't have {netherPrecision} or {clearcasting}, but do have {arcaneOrb} and four{' '}
                {arcaneCharge}s.
              </li>
            </ul>
          </div>
        )}
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
