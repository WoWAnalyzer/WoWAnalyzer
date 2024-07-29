import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink, TooltipElement } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DANCING_MIST_CHANCE, RAPID_DIFFUSION_DURATION } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getInvigHitsPerCast, isFromVivify } from '../../normalizers/CastLinkNormalizer';
import UpliftedSpirits from './UpliftedSpirits';

const RAPID_DIFFUSION_SPELLS = [
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
];
const BASE_AVERAGE_REMS = 2.22;
const RM_AVG_REM_DIFF = 3;

type InvigoratingMistHealPerPlayer = { [key: number]: Set<string> };

class Vivify extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    upliftedSpirits: UpliftedSpirits,
  };

  protected spellUsable!: SpellUsable;
  protected upliftedSpirits!: UpliftedSpirits;

  casts: number = 0;
  healsPerPlayer: InvigoratingMistHealPerPlayer = {};
  mainTargetHealing: number = 0;
  mainTargetOverhealing: number = 0;

  fullOverhealCleaves: number = 0;
  cleaveHits: number = 0;
  cleaveHealing: number = 0;
  cleaveOverhealing: number = 0;

  gomHealing: number = 0;
  gomOverhealing: number = 0;
  lastCastTarget: number = 0;

  expectedAverageReMs: number = 0;
  rdCasts: number = 0;

  risingMistActive: boolean;
  dancingMistActive: boolean;
  rapidDiffusionActive: boolean;

  castEntries: BoxRowEntry[] = [];
  vivifyGoodCrits: number = 0;
  vivifyWastedCrits: number = 0;

  constructor(options: Options) {
    super(options);
    this.risingMistActive = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    this.dancingMistActive = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT);
    this.rapidDiffusionActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.RAPID_DIFFUSION_TALENT,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RAPID_DIFFUSION_SPELLS),
      this.rapidDiffusionReMs,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleViv);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_MISTS_HEAL),
      this.handleInvigoratingMists,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleMastery,
    );
  }

  get averageRemPerVivify() {
    return this.cleaveHits / this.casts || 0;
  }

  //TODO: update for pool of mists / heart of the jade serpent
  get estimatedAverageReMs() {
    if (this.risingMistActive) {
      this.expectedAverageReMs = BASE_AVERAGE_REMS * 2;
    } else {
      this.expectedAverageReMs = BASE_AVERAGE_REMS;
    }
    if (this.dancingMistActive) {
      this.expectedAverageReMs += this.averageReMsFromDancingMist;
    }
    if (this.rapidDiffusionActive) {
      this.expectedAverageReMs += this.averageReMsFromRapidDiffusion;
    }
    return this.expectedAverageReMs;
  }

  get averageReMsFromRapidDiffusion() {
    const fightLengthSec = this.owner.fightDuration;
    return (
      (RAPID_DIFFUSION_DURATION *
        this.selectedCombatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT)) /
      (fightLengthSec / this.rdCasts)
    );
  }

  get avgRawPerCast() {
    return (
      (this.cleaveHealing +
        this.cleaveOverhealing +
        this.mainTargetHealing +
        this.mainTargetOverhealing) /
      this.casts
    );
  }

  get avgHealingPerCast() {
    return (this.cleaveHealing + this.mainTargetHealing) / this.casts;
  }

  get averageReMsFromDancingMist() {
    return (
      this.expectedAverageReMs *
      (DANCING_MIST_CHANCE *
        this.selectedCombatant.getTalentRank(TALENTS_MONK.DANCING_MISTS_TALENT))
    );
  }

  rapidDiffusionReMs(event: CastEvent) {
    this.rdCasts += 1;
  }

  vivCast(event: CastEvent) {
    this.casts += 1;
  }

  handleInvigoratingMists(event: HealEvent) {
    const effective = event.amount + (event.absorbed || 0);
    if (!effective) {
      this.fullOverhealCleaves += 1;
    }
    this.cleaveHealing += effective;
    this.cleaveOverhealing += event.overheal || 0;
    this.cleaveHits += 1;
  }

  handleViv(event: HealEvent) {
    this._tallyCastEntry(event);
    this.mainTargetHealing += event.amount + (event.absorbed || 0);
    this.mainTargetOverhealing += event.overheal || 0;
  }

  handleMastery(event: HealEvent) {
    if (isFromVivify(event)) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
    }
  }

  get guideSubsection(): JSX.Element {
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const explanation = (
      <p>
        <SpellLink spell={SPELLS.VIVIFY} /> quickly becomes your best healing spell when you have
        high counts of <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> out on the raid via{' '}
        <SpellLink spell={TALENTS_MONK.INVIGORATING_MISTS_TALENT} />, and will be a major portion of
        your healing when used correctly. <SpellLink spell={SPELLS.VIVIFY} />
        's effectiveness goes hand in hand with your{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> count - the more you have out at a
        given time, the more healing and better mana efficiency this spell has. This further
        emphasizes the importance of casting your rotational abilities in{' '}
        <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> as often as possible.{' '}
        <strong>
          Now that square-root scaling is applied to{' '}
          <SpellLink spell={TALENTS_MONK.INVIGORATING_MISTS_TALENT} />, be wary of casting{' '}
          <SpellLink spell={SPELLS.VIVIFY} /> when at high{' '}
          <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> counts when it will result in high
          amounts of overheal. This will negatively impact your effective healing done.
        </strong>
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>
              <SpellLink spell={SPELLS.VIVIFY} /> casts
            </strong>{' '}
            <small> GUIDANCE COMING SOON. Mouseover to see details about each cast.</small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
          <div style={styleObj}>
            <small style={styleObjInner}>
              <SpellLink spell={TALENTS_MONK.INVIGORATING_MISTS_TALENT} /> -{' '}
            </small>
            <strong>{this.averageRemPerVivify.toFixed(1)}</strong>{' '}
            <small>
              average cleaves per <SpellLink spell={SPELLS.VIVIFY} />
            </small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.mainTargetHealing + this.cleaveHealing)} overall healing from
                casting <SpellLink spell={SPELLS.VIVIFY} />.
              </li>
              <li>
                {formatNumber(this.cleaveHealing)} healing from{' '}
                <SpellLink spell={TALENTS_MONK.INVIGORATING_MISTS_TALENT} />
              </li>
              <li>{formatNumber(this.fullOverhealCleaves)} cleaves that were 100% overheal.</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.INVIGORATING_MISTS_TALENT}>
          <>
            {this.averageRemPerVivify.toFixed(2)}{' '}
            <small>
              Average Cleaves per <SpellLink spell={SPELLS.VIVIFY} />
            </small>
            <br />
            <TooltipElement
              content={
                <>
                  {formatNumber(this.avgRawPerCast)} <small>raw healing per cast</small>
                </>
              }
            >
              {formatNumber(this.avgHealingPerCast)} <small>healing per cast</small>
            </TooltipElement>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  private _tallyUpliftedSpiritsCDR(event: HealEvent) {
    if (this.upliftedSpirits.active && event.hitType === HIT_TYPES.CRIT) {
      if (this.spellUsable.isOnCooldown(this.upliftedSpirits.activeTalent.id)) {
        this.vivifyGoodCrits += 1;
      } else {
        this.vivifyWastedCrits += 1;
      }
    }
  }

  private _makeHealId(event: HealEvent): string {
    return (
      event.targetID + '_' + event.timestamp + '_' + event.amount + '_' + (event.overheal || 0)
    );
  }

  private _tallyCastEntry(vivifyHeal: HealEvent) {
    const invigoratingMistHits = getInvigHitsPerCast(vivifyHeal) as HealEvent[];
    this.vivifyGoodCrits = 0;
    this.vivifyWastedCrits = 0;
    let fullOverhealHits = 0;
    let healingPerCast = 0;
    let overhealPerCast = 0;

    let rems = 0;

    //array to track which targets have already been processed for this event group
    const targetsInGrouping: Set<number> = new Set<number>();

    /*Vivacious Vivification can proc during a hardcasted vivify and is not consumed until the following vivify cast. This is often
     * causing two vivify casts and their subsequent invig mist healing to occur simultaneously. Invigorating mists can only hit a target
     * once per vivify cast, so we can track and filter out the targets that have already been hit to properly allocate each cast.
     */
    invigoratingMistHits.forEach((invigHeal) => {
      const targetId = invigHeal.targetID;
      const heal_id = this._makeHealId(invigHeal);

      //check healsPerPlayer to see if this heal event has already been processed previously
      // and check targetsInGrouping to make sure we haven't already processed a heal on this target for this set yet
      if (
        (!this.healsPerPlayer[targetId] || !this.healsPerPlayer[targetId].has(heal_id)) &&
        !targetsInGrouping.has(targetId)
      ) {
        const effective = invigHeal.amount + (invigHeal.absorbed || 0);

        fullOverhealHits += !effective ? 1 : 0;
        healingPerCast += effective;
        overhealPerCast += invigHeal.overheal || 0;

        this._tallyUpliftedSpiritsCDR(invigHeal);
        //add this heal to the processed heals per player
        this.healsPerPlayer[targetId]
          ? this.healsPerPlayer[targetId].add(heal_id)
          : (this.healsPerPlayer[targetId] = new Set<string>().add(heal_id));

        //add this this target to the processed heals per cast
        targetsInGrouping.add(targetId);
        rems += 1;
      }
    });

    healingPerCast += vivifyHeal.amount + (vivifyHeal.absorbed || 0);
    overhealPerCast += vivifyHeal.overheal || 0;
    this._tallyUpliftedSpiritsCDR(vivifyHeal);

    const percentOverheal = overhealPerCast / (healingPerCast + overhealPerCast);

    let value = QualitativePerformance.Fail;
    //TODO: update this for TWW rem averages (pool of mists / heart of the jade serpent)
    const rmConst =
      this.selectedCombatant.getTalentRank(TALENTS_MONK.RISING_MIST_TALENT) * RM_AVG_REM_DIFF;
    if (rems >= 8 + rmConst && percentOverheal <= 0.6) {
      value = QualitativePerformance.Perfect;
    } else if (rems >= 6 + rmConst && percentOverheal <= 0.55) {
      value = QualitativePerformance.Good;
    } else if (rems >= 4 + rmConst && percentOverheal <= 0.7) {
      value = QualitativePerformance.Good;
    } else if (fullOverhealHits <= 3 + rmConst || percentOverheal <= 0.3) {
      value = QualitativePerformance.Ok;
    }

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(vivifyHeal.timestamp)}</strong>, ReMs:{' '}
        <strong>{rems}</strong>
        <div></div>
        <>
          Healing: {formatNumber(healingPerCast)} ({formatPercentage(percentOverheal)}% overheal)
        </>
        <div></div>
        {this.upliftedSpirits.active && (
          <>
            <SpellLink spell={this.upliftedSpirits.activeTalent} /> Cooldown Reduction:{' '}
            {this.vivifyGoodCrits > 0 && <>{this.vivifyGoodCrits}s </>}
            {this.vivifyWastedCrits > 0 && <>{this.vivifyWastedCrits}s wasted</>}
            {this.vivifyGoodCrits + this.vivifyWastedCrits === 0 && <>0s</>}
          </>
        )}
      </>
    );
    this.castEntries.push({ value, tooltip });
  }
}

export default Vivify;
