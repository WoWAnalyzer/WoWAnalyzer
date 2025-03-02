import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Entity from 'parser/core/Entity';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { AbsorbedEvent, FightEndEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STAT from 'parser/shared/modules/features/STAT';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';

import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  HARMONIUS_BLOOMING_EXTRA_STACKS,
  MASTERY_STACK_BUFF_IDS,
  masteryHotCountToMult,
  TRIPLE_MASTERY_BENEFIT_IDS,
} from 'analysis/retail/druid/restoration/constants';

const DEBUG = false;

// TODO - LB extra stack handling is very "special case-y", better way to do it? Mapping of stacks?
/**
 * Resto Druid's "Mastery: Harmony" -
 * Your healing is increased by X% for each of your Restoration heal over time effects on the target.
 *
 * When attempting to attribute healing to a Druid HoT, we must look not only at the direct healing from the HoT
 * but also the amount the Druid's *other spells* are boosted by the presence of that HoT.
 *
 * This module performs the background calculations needed to make these attributions.
 */
class Mastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  // tracks mastery attribution by spell
  spellAttributions: MasteryAttributionsBySpell = {};

  // Tracks healing attributable to mastery buffs
  buffAttributions: MasteryAttributionsByBuff = {};

  /** Number of extra stacks Lifebloom gives due to the talent */
  extraLbStacks: number;
  /** spellId of Lifebloom (changes based on if Undergrowth is picked) */
  lbBuffId: number;

  constructor(options: Options) {
    super(options);

    this.extraLbStacks = this.selectedCombatant.hasTalent(TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT)
      ? HARMONIUS_BLOOMING_EXTRA_STACKS
      : 0;
    this.lbBuffId = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_TALENT)
      ? SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id
      : SPELLS.LIFEBLOOM_HOT_HEAL.id;

    // inits spellAttributions with an entry for each HoT that works with Mastery
    MASTERY_STACK_BUFF_IDS.forEach((id) => {
      this.spellAttributions[id] = new MasterySpellAttribution();
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbed);

    // for outputting final computed values when debug is enabled
    DEBUG && this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onHeal(event: HealEvent): void {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const healVal = HealingValue.fromEvent(event);

    if (target === null) {
      return;
    }

    if (this.spellAttributions[spellId]) {
      this.spellAttributions[spellId].direct += healVal.effective;
    }

    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      const hotsOn = this.getHotsOn(target);
      const hasTripleMasteryBenefit = TRIPLE_MASTERY_BENEFIT_IDS.includes(spellId);
      const numHotsOn = this.getHotCount(target) * (hasTripleMasteryBenefit ? 3 : 1);
      const decomposedHeal = this._decompHeal(healVal, numHotsOn);

      if (DEBUG) {
        let logPrefix = 'ALL-EFFECTIVE';
        if (healVal.effective === 0) {
          logPrefix = 'ALL-OVERHEAL';
        } else if (healVal.overheal > 0) {
          logPrefix = 'PARTIAL-EFFECTIVE';
        }
        console.log(
          `${logPrefix} - ${event.ability.name}: ${healVal.effective.toFixed(
            0,
          )} (O: ${healVal.overheal.toFixed(
            0,
          )}) // Mastery: ${this.statTracker.currentMasteryPercentage.toFixed(
            2,
          )} Hots: ${numHotsOn} EffMult: ${decomposedHeal.effectiveStackMult}`,
        );
      }

      this.totalNoMasteryHealing += decomposedHeal.noMastery;
      this.druidSpellNoMasteryHealing += decomposedHeal.noMastery;
      this.masteryTimesHealing += decomposedHeal.noMastery * decomposedHeal.effectiveStackMult;

      // tally benefits for spells
      hotsOn
        .filter((hotOn) => hotOn !== spellId) // don't double count
        .forEach((hotOn) => this._tallyMasteryBenefit(hotOn, spellId, decomposedHeal.oneStack));

      // tally benefits for ratings buffs
      this.selectedCombatant
        .activeBuffs()
        .filter(
          (buff) =>
            this.statTracker.statBuffs[buff.ability.guid] &&
            this.statTracker.statBuffs[buff.ability.guid].mastery,
        )
        .forEach((buff) => {
          const buffId = buff.ability.guid;
          const statBuff = this.statTracker.statBuffs[buffId];
          if (!this.buffAttributions[buffId]) {
            this.buffAttributions[buffId] = new MasteryBuffAttribution(
              this.statTracker.getBuffValue(statBuff, statBuff.mastery),
            );
          }

          this.buffAttributions[buffId].attributable += calculateEffectiveHealing(
            event,
            decomposedHeal.relativeBuffBenefit(
              this.buffAttributions[buffId].buffAmount * buff.stacks,
            ),
          );
        });
    } else {
      this.totalNoMasteryHealing += healVal.effective;
    }
  }

  onAbsorbed(event: AbsorbedEvent): void {
    this.totalNoMasteryHealing += event.amount;
  }

  onFightEnd(_: FightEndEvent): void {
    DEBUG && this.log(`Spell Attributions`, this.spellAttributions);
    DEBUG && this.log(`Buff Attributions`, this.buffAttributions);
  }

  /* accessors for computed values */

  /**
   * Gets the direct healing attributed to the given resto HoT ID.
   * Should be same as number in WCL and includes own mastery stack.
   * @param healId the spell ID of the HoT
   */
  getDirectHealing(healId: number): number {
    return this.spellAttributions[healId].direct;
  }

  /*
   * Gets the total mastery healing attributed to the given resto HoT ID
   */
  /**
   * The mastery healing attributed to the given resto HoT ID.
   * This is healing done by *other* spells that were boosted by the presence
   * of this HoT on the same target.
   * @param healId the spell ID of the HoT
   */
  getMasteryHealing(healId: number) {
    return this.spellAttributions[healId].totalMastery;
  }

  /*
   * Gets the total healing attributable to the given resto HoT IDs.
   * Counts both direct and by mastery, and avoids the mastery/direct double count issue between the hots.
   */
  getMultiMasteryHealing(healIds: number[]) {
    let total = 0;
    healIds.forEach((healId) => {
      total += Object.entries(this.spellAttributions[healId].mastery)
        .filter((entry) => !healIds.includes(Number(entry[0])))
        .reduce((sum, entry) => sum + entry[1], 0);
      total += this.spellAttributions[healId].direct;
    });
    return total;
  }

  /**
   * Gets the spell attribution object for a HoT with the given ID.
   * @param healId the HoT's ID
   */
  getHealingDetails(healId: number) {
    return this.spellAttributions[healId];
  }

  /**
   * Gets the buff attribution object for a mastery buff with the given ID.
   * @param buffId the buff ID
   */
  getBuffBenefit(buffId: number): MasteryBuffAttribution | undefined {
    return this.buffAttributions[buffId];
  }

  /**
   * This is the average multiple of player's mastery bonus the player's heals benefitted from, weighted by effective healing done.
   * Heals and absorbs that don't benefit from mastery are factored into the weighting.
   * Because as of patch 11.1 mastery stacks have diminishing returns, this will NOT be equivalent to average stacks.
   * For example, if player's mastery is 10% and their calculated weighted average bonus is 17%, this will return 1.7.
   */
  getAverageMasteryBonusMult() {
    return this.masteryTimesHealing / this.totalNoMasteryHealing;
  }

  /**
   * This is the average multiple of player's mastery bonus the player's heals benefitted from, weighted by effective healing done.
   * This ONLY counts heals that actually benefit from mastery.
   * Because as of patch 11.1 mastery stacks have diminishing returns, this will NOT be equivalent to average stacks.
   * For example, if player's mastery is 10% and their calculated weighted average bonus is 17%, this will return 1.7.
   */
  getAverageDruidSpellMasteryBonusMult() {
    return this.masteryTimesHealing / this.druidSpellNoMasteryHealing;
  }

  /**
   * Returns the spell IDs of the Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotsOn(target: Entity): number[] {
    return target
      .activeBuffs()
      .map((buffObj) => buffObj.ability.guid)
      .filter((buffId) => MASTERY_STACK_BUFF_IDS.includes(buffId));
  }

  /**
   * Returns the number of Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotCount(target: Entity): number {
    const hotsOn = this.getHotsOn(target);
    const extraStacks = hotsOn.includes(this.lbBuffId) ? this.extraLbStacks : 0;
    return hotsOn.length + extraStacks;
  }

  /**
   * Tallies a heal with spellAttributions
   * @param hotId the ID of the HoT on the healed target
   * @param healId the ID of the heal being boosted
   * @param amount the amount of the boost
   */
  _tallyMasteryBenefit(hotId: number, healId: number, amount: number): void {
    const hotMastery = this.spellAttributions[hotId].mastery;
    const adjustedAmount = hotId === this.lbBuffId ? amount * (1 + this.extraLbStacks) : amount;
    if (hotMastery[healId]) {
      hotMastery[healId] += adjustedAmount;
    } else {
      hotMastery[healId] = adjustedAmount;
    }
  }

  // a version of _decompHeal for call by external modules, takes the heal event
  decomposeHeal(event: HealEvent): DecomposedHeal | null {
    const target = this.combatants.getEntity(event);
    if (target === null) {
      return null;
    }
    const healVal = HealingValue.fromEvent(event);
    return this._decompHeal(healVal, this.getHotCount(target));
  }

  /**
   * Decomposes a heal's amount to show the amounts attributable to mastery
   * @param healVal the HealingValue being decomposed
   * @param hotCount the number of HoTs present on the target which provide Mastery boost
   */
  _decompHeal(healVal: HealingValue, hotCount: number): DecomposedHeal {
    // mastery diminishing returns with more HoTs on - do the table lookup and get overall bonus
    const hotMult = masteryHotCountToMult(hotCount);
    const masteryBonus = this.statTracker.currentMasteryPercentage;
    const healBonus = hotMult * masteryBonus;
    const healMasteryMult = 1 + healBonus;
    // the raw healing this spell would have done if it benefitted from zero mastery stacks
    const rawNoMasteryHealing = healVal.raw / healMasteryMult;
    // effective healing spell would have done if it benefitted from zero mastery stacks
    const noMasteryHealing = Math.min(rawNoMasteryHealing, healVal.effective);

    // because Mastery is a bonus on top of the base healing, all overhealing is counted against Mastery
    const effectiveMasteryHealing = healVal.effective - noMasteryHealing;
    // when Mastery bonus is partially but not completely overhealing, the stacks equally share attribution
    const oneStackMasteryHealingEffective = effectiveMasteryHealing / hotCount;

    const oneStackMasteryHealingRaw = rawNoMasteryHealing * masteryBonus;
    // the multiplier of mastery that we actually benefitted from once overheal is considered.
    const effectiveStackMult = effectiveMasteryHealing / oneStackMasteryHealingRaw;

    const relativeBuffBenefit = (buffRating: number) => {
      const buffBonus =
        (hotCount * buffRating) /
        this.statTracker.ratingNeededForNextPercentage(
          this.statTracker.currentMasteryRating,
          this.statTracker.statBaselineRatingPerPercent[STAT.MASTERY],
          this.selectedCombatant.spec?.masteryCoefficient,
        );
      return buffBonus / healMasteryMult;
    };

    return {
      noMastery: noMasteryHealing,
      oneStack: oneStackMasteryHealingEffective,
      effectiveStackMult,
      relativeBuffBenefit,
    };
  }
}

/**
 * A mapping from spell guid to the MasteryAttribution for that spell
 */
type MasteryAttributionsBySpell = { [key: number]: MasterySpellAttribution };

/**
 * A HoT's mastery attribution.
 */
class MasterySpellAttribution {
  direct: number; // the direct healing from the HoT, should be same as entry in WCL. Includes benefit from own stack of Mastery.
  mastery: { [key: number]: number }; // a mapping from spell ID to how much this HoT boosted it via Mastery.

  constructor() {
    this.direct = 0;
    this.mastery = {};
  }

  get totalMastery(): number {
    return Object.values(this.mastery).reduce((s, v) => s + v, 0);
  }

  get total(): number {
    return this.direct + this.totalMastery;
  }
}

/**
 * A mapping from buff guid to the attribution amount for that buff
 */
type MasteryAttributionsByBuff = { [key: number]: MasteryBuffAttribution };

/**
 * A Buff's mastery attribution.
 */
class MasteryBuffAttribution {
  attributable: number; // the amount of healing attributable to the buff
  buffAmount: number; // the amount of mastery rating the buff provides

  constructor(buffAmount: number) {
    this.attributable = 0;
    this.buffAmount = buffAmount;
  }
}

/**
 * A instance of healing that has been decomposed into parts based on Mastery attribution
 */
interface DecomposedHeal {
  /** The amount of effective healing that would have been done before being boosted by mastery */
  noMastery: number;
  /** The amount of effective heal added per stack of mastery */
  oneStack: number;
  /** Multiplier of our mastery that we actually benefitted from once overheal is considered */
  effectiveStackMult: number;
  /** Function from mastery buff rating to heal attributable to that buff */
  relativeBuffBenefit: (rating: number) => number;
}

export default Mastery;
