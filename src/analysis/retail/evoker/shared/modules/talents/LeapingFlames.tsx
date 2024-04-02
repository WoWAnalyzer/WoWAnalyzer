import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatDuration, formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { EventType, RemoveBuffEvent } from 'parser/core/Events';
import {
  eventGeneratedEB,
  getGeneratedEBEvents,
  getWastedEBEvents,
  getLeapingEvents,
  eventWastedEB,
  getEBSource,
  getLivingFlameCastHit,
  getLeapingCast,
} from '../normalizers/LeapingFlamesNormalizer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Soup from 'interface/icons/Soup';
import { SpellLink } from 'interface';
import { InformationIcon, WarningIcon } from 'interface/icons';

/**
 * Fire Breath causes your next Living Flame to strike 1 additional target per empower level.
 */
class LeapingFlames extends Analyzer {
  leapingFlamesDamage = 0;
  leapingFlamesHealing = 0;
  leapingFlamesOverHealing = 0;

  leapingFlamesBuffs = 0;
  leapingFlamesConsumptions = 0;
  leapingFlamesWasted = 0;

  leapingFlamesExtraHits = 0;

  essenceBurstGenerated = 0;
  maybeEssenceBurstGenerated = 0;
  essenceBurstWasted = 0;
  maybeEssenceBurstWasted = 0;

  hasAttunement = this.selectedCombatant.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT);
  maxEB = this.hasAttunement ? 2 : 1;
  hasDragonrage = this.selectedCombatant.hasTalent(TALENTS.DRAGONRAGE_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LEAPING_FLAMES_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LEAPING_FLAMES_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LEAPING_FLAMES_BUFF),
      this.onApplyBuff,
    );
  }

  onApplyBuff() {
    this.leapingFlamesBuffs += 1;
  }

  /**
   *
   */
  onRemoveBuff(leapingBuff: RemoveBuffEvent) {
    console.group(
      formatDuration(leapingBuff.timestamp - this.owner.fight.start_time),
      '- inDragonRage',
      this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id),
    );
    const lfCast = getLeapingCast(leapingBuff);
    if (!lfCast) {
      this.leapingFlamesWasted += 1;
      console.log('buff wasted');
      console.groupEnd();
      return;
    }
    this.leapingFlamesConsumptions += 1;

    const leapingEvents = getLeapingEvents(lfCast);
    if (!leapingEvents.length) {
      console.log('no leaping hits');
      console.groupEnd();
      return;
    }

    const { damageHits, healHits } = leapingEvents.reduce(
      (acc, event) => {
        if (event.type === EventType.Damage) {
          acc.damageHits += 1;
          this.leapingFlamesDamage += event.amount + (event.absorbed ?? 0);
        } else {
          this.leapingFlamesHealing += event.amount;
          this.leapingFlamesOverHealing += event.overheal ?? 0;
          if (event.amount > 0) {
            acc.healHits += 1;
          }
        }
        return acc;
      },
      { damageHits: 0, healHits: 0 },
    );

    const generatedEB = getGeneratedEBEvents(lfCast);
    const wastedEB = getWastedEBEvents(lfCast);
    if (!generatedEB.length && !wastedEB.length) {
      // potentially you don't bail here if you want to show expected vs actual procs
      console.log('no EBs');
      console.groupEnd();
      return;
    }

    const allEBEvents = [...generatedEB, ...wastedEB];

    const { unknownGen, unknownWaste, healGen, healWaste } = allEBEvents.reduce(
      (acc, event) => {
        const ebSource = getEBSource(event);
        const isWaste = event.type === EventType.RefreshBuff;

        switch (ebSource) {
          case 'Heal':
            if (isWaste) {
              acc.healWaste += 1;
            } else {
              acc.healGen += 1;
            }
            break;
          case 'Unknown':
            if (isWaste) {
              acc.unknownWaste += 1;
            } else {
              acc.unknownGen += 1;
            }
            break;
        }

        return acc;
      },
      { unknownGen: 0, unknownWaste: 0, healGen: 0, healWaste: 0 },
    );

    console.log('damageHits', damageHits);
    console.log('healHits', healHits);
    console.log('unknownGen', unknownGen);
    console.log('unknownWaste', unknownWaste);
    console.log('healGen', healGen);
    console.log('healWaste', healWaste);

    console.log('generatedEB', generatedEB);
    console.log('wastedEB', wastedEB);

    let totalGeneratedEB = generatedEB.length;
    let totalWastedEB = wastedEB.length;

    /** In Dragonrage all generators have 100% chance of generating EB, so leaping
     * will have provided everything beyond the first one. */
    const inDragonRage =
      this.hasDragonrage && this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id);
    if (inDragonRage) {
      const maxEB = this.maxEB - 1;

      /** Player isn't running attunement and as such leaping can't ever provide value.
       * You *could* show the wasted EB from here, but it doesn't make sense to bonk players
       * for this, since realistically it isn't actually a waste.
       * We will for now just warn about it in the stats module. */
      if (maxEB === 0) {
        return;
      }

      // Determine whether Dragonrage generated or wasted and downjust accordingly
      if (totalGeneratedEB > 0) {
        totalGeneratedEB -= 1;
      } else if (totalWastedEB > 0) {
        totalWastedEB -= -1;
      }

      /** Technically you can spend some of the gained EB before you gain the next one.
       * Meaning you can gain more than 1 EB, so we will count all the excess.
       * But you can't realistically waste more than you can realistically gain.
       * So we will only ever count the realistic amount of wasted EB.
       *
       * It can be observed in this log @26:04.915:
       * /report/rXkDfLBavt1mWpKx/4-Mythic++Darkheart+Thicket+-+Kill+(26:32)/Griwyvoker */
      this.essenceBurstGenerated += totalGeneratedEB;

      const wastedEBToAccountFor = Math.min(totalWastedEB, maxEB);
      const actualWastedEB = Math.max(wastedEBToAccountFor - totalGeneratedEB, 0);
      this.essenceBurstWasted += actualWastedEB;

      console.info('Attributed', totalGeneratedEB, 'EB gen');
      console.info('Attributed', actualWastedEB, 'EB waste');
      console.groupEnd();

      return;
    }

    // Outside of the Dragonrage freebie we actually need to figure out the probabilities ourselves
    const castHit = getLivingFlameCastHit(lfCast);
    const castHitGeneratedEB = Boolean(castHit && eventGeneratedEB(castHit));
    const castHitWastedEB = Boolean(castHit && eventWastedEB(castHit));

    if (totalGeneratedEB > 0) {
      const ebFromLeaping = this.getLeapingEBShare(
        healGen,
        castHitGeneratedEB,
        damageHits,
        healHits,
        totalGeneratedEB,
      );
      this.essenceBurstGenerated += ebFromLeaping.guaranteedFromLeaping;
      this.maybeEssenceBurstGenerated += ebFromLeaping.maybeFromLeaping;
      console.info(
        'Gen Attributed guaranteedFromLeaping:',
        ebFromLeaping.guaranteedFromLeaping,
        'potential',
        ebFromLeaping.maybeFromLeaping,
      );
    }

    /** Whilst we could show every single overcapped EB, it doesn't make sense to do so
     * If we generate 3 EB we (potentially) overcap 1, but you can't actually (reliably)
     * avoid overcapping those ones, so we ignore the unrealistic excess. */
    const maxPossibleWastedEB = Math.max(this.maxEB - totalGeneratedEB, 0);
    const wastedEBToAccountFor = Math.min(maxPossibleWastedEB, totalWastedEB);
    console.log('wastedEBToAccountFor', wastedEBToAccountFor);

    if (wastedEBToAccountFor > 0) {
      const wastedEBFromLeaping = this.getLeapingEBShare(
        healWaste,
        castHitWastedEB,
        damageHits,
        healHits,
        wastedEBToAccountFor,
      );

      this.essenceBurstWasted += wastedEBFromLeaping.guaranteedFromLeaping;
      this.maybeEssenceBurstWasted += wastedEBFromLeaping.maybeFromLeaping;
      console.info(
        'Waste Attributed guaranteedFromLeaping:',
        wastedEBFromLeaping.guaranteedFromLeaping,
        'potential',
        wastedEBFromLeaping.maybeFromLeaping,
      );
    }

    console.groupEnd();
  }

  /** Get the estimated share of leaping flames gen/waste
   * Some of it is deterministic, such as heal procs that come along with
   * later heal hits, whilst the ones that come on cast aren't */
  getLeapingEBShare(
    healProcs: number,
    castHitProc: boolean,
    damageHits: number,
    healHits: number,
    procsToAccountFor: number,
  ) {
    let guaranteedFromLeaping = 0;
    let maybeFromLeaping = 0;

    /** First we deal with all the deterministic sources */

    // We had more than 1 procs so we know leaping provided the excess ones
    if (procsToAccountFor > 1) {
      guaranteedFromLeaping = 1;
      procsToAccountFor -= procsToAccountFor - 1;
      console.info('attributed 1 of 2 procs - procsToAccountFor', procsToAccountFor);
    }

    // We know for certain that 1 EB came from the initial cast
    if (castHitProc) {
      procsToAccountFor -= 1;
      console.info('removed 1 procsToAccountFor', procsToAccountFor);
    }

    // Heal proc sources are deterministic so we can directly distribute them
    if (healProcs > 0) {
      guaranteedFromLeaping += Math.min(healProcs, procsToAccountFor);
      procsToAccountFor -= Math.min(healProcs, procsToAccountFor);
      console.info('attributed', healProcs, 'healProcs - procsToAccountFor', procsToAccountFor);
    }

    if (procsToAccountFor === 0) {
      return { guaranteedFromLeaping, maybeFromLeaping };
    }

    /** Then we deal with the non-deterministic sources */

    // If the proc came from a damage hit we can't be sure about the source
    // Each hit will have equal chances to generate/waste the initial EB so we calculate a simple
    // Probability and use it to attribute "fractions" of EBs to leaping, we then round
    // these fractions in the end to get an estimate of Leapings contribution
    const probabilityEBIsFromLeaping = 1 - 1 / (1 + damageHits + healHits - guaranteedFromLeaping);
    maybeFromLeaping += probabilityEBIsFromLeaping;
    return { guaranteedFromLeaping, maybeFromLeaping };
  }

  statistic() {
    console.log('Total guaranteed:');
    console.log('gen:', this.essenceBurstGenerated);
    console.log('waste:', this.essenceBurstWasted);
    console.log('Total potential:');
    console.log('gen:', this.maybeEssenceBurstGenerated);
    console.log('waste:', this.maybeEssenceBurstWasted);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.leapingFlamesDamage)}</li>
            <li>Healing: {formatNumber(this.leapingFlamesHealing)}</li>
            <li>Overhealing: {formatNumber(this.leapingFlamesOverHealing)}</li>
            <li>Consumed: {formatNumber(this.leapingFlamesConsumptions)} buffs</li>
            <li>Wasted: {formatNumber(this.leapingFlamesWasted)} buffs</li>
            Wasted <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> represent the amount you lost out
            on due to overcapping.
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.LEAPING_FLAMES_TALENT} />
          </label>
          {this.hasDragonrage && !this.hasAttunement && (
            <div>
              <WarningIcon />{' '}
              <small>
                You don't have <SpellLink spell={TALENTS.ESSENCE_ATTUNEMENT_TALENT} /> talented, so
                you'll miss out on a significant amount of{/*  */}{' '}
                <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> during{' '}
                <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} />!
              </small>
            </div>
          )}
          <div className="value">
            <ItemDamageDone amount={this.leapingFlamesDamage} />
          </div>
          <div className="value">
            <ItemHealingDone amount={this.leapingFlamesHealing} />
          </div>
          <div className="value">
            <Soup /> {Math.round(this.essenceBurstGenerated + this.maybeEssenceBurstGenerated)}
            <small>
              {' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> generated
            </small>
          </div>
          <div className="value">
            <InformationIcon /> {Math.round(this.essenceBurstWasted + this.maybeEssenceBurstWasted)}
            <small>
              {' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> wasted
            </small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default LeapingFlames;
