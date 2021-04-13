import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { AbsorbedEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STAT from 'parser/shared/modules/features/STAT';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';

import { DRUID_HEAL_INFO, getSpellInfo } from '../../SpellInfo';
import { HealerSpellInfo } from 'parser/shared/modules/features/BaseHealerStatValues';
import Entity from 'parser/core/Entity';

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

  constructor(options: Options) {
    super(options);

    // inits spellAttributions with an entry for each HoT that works with Mastery
    Object.entries(DRUID_HEAL_INFO).forEach(([guid, buff]: [string, HealerSpellInfo]) => {
      if (buff.masteryStack) {
        this.spellAttributions[guid] = new MasterySpellAttribution();
      }
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbed);
  }

  onHeal(event: HealEvent): void {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);

    if (target === null) {
      return;
    }

    if (this.spellAttributions[spellId]) {
      this.spellAttributions[spellId].direct += healVal.effective;
    }

    if (getSpellInfo(spellId).mastery) {
      const hotsOn = this.getHotsOn(target);
      const numHotsOn = hotsOn.length;
      const decomposedHeal = this._decompHeal(healVal, numHotsOn);

      this.totalNoMasteryHealing += decomposedHeal.noMastery;
      this.druidSpellNoMasteryHealing += decomposedHeal.noMastery;
      this.masteryTimesHealing += decomposedHeal.noMastery * decomposedHeal.effectiveStackBenefit;

      // tally benefits for spells
      hotsOn
        .filter((hotOn) => hotOn !== spellId) // don't double count
        .forEach((hotOn) =>
          this._tallyMasteryBenefit(hotOn.toString(), spellId.toString(), decomposedHeal.oneStack),
        );

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
            decomposedHeal.relativeBuffBenefit(this.buffAttributions[buffId].buffAmount),
          );
        });
    } else {
      this.totalNoMasteryHealing += healVal.effective;
    }
  }

  onAbsorbed(event: AbsorbedEvent): void {
    this.totalNoMasteryHealing += event.amount;
  }

  /* accessors for computed values */

  /**
   * Gets the direct healing attributed to the given resto HoT ID.
   * Should be same as number in WCL and includes own mastery stack.
   * @param healId the spell ID of the HoT
   */
  getDirectHealing(healId: string): number {
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
  getMasteryHealing(healId: string) {
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
  getHealingDetails(healId: string) {
    return this.spellAttributions[healId];
  }

  /**
   * Gets the buff attribution object for a mastery buff with the given ID.
   * @param buffId the buff ID
   */
  getBuffBenefit(buffId: string): MasteryBuffAttribution | undefined {
    return this.buffAttributions[buffId];
  }

  /**
   * This is the average number of mastery stacks the player's heals benefitted from, weighted by healing done.
   * Heals and absorbs that don't benefit from mastery are counted as zero mastery stack heals.
   */
  getAverageTotalMasteryStacks() {
    return this.masteryTimesHealing / this.totalNoMasteryHealing;
  }

  /**
   * This is the average number of mastery stacks the player's heals benefitted from, weighted by healing done.
   * Only heals that benefit from mastery are counted.
   */
  getAverageDruidSpellMasteryStacks() {
    return this.masteryTimesHealing / this.druidSpellNoMasteryHealing;
  }

  /**
   * Returns the spell IDs of the Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotsOn(target: Entity): number[] {
    return target
      .activeBuffs()
      .map((buffObj) => buffObj.ability.guid)
      .filter((buffId) => getSpellInfo(buffId).masteryStack);
  }

  /**
   * Returns the number of Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotCount(target: Entity): number {
    return this.getHotsOn(target).length;
  }

  /**
   * Tallies a heal with spellAttributions
   * @param hotId the ID of the HoT on the healed target
   * @param healId the ID of the heal being boosted
   * @param amount the amount of the boost
   */
  _tallyMasteryBenefit(hotId: string, healId: string, amount: number): void {
    const hotMastery = this.spellAttributions[hotId].mastery;
    if (hotMastery[healId]) {
      hotMastery[healId] += amount;
    } else {
      hotMastery[healId] = amount;
    }
  }

  // a version of _decompHeal for call by external modules, takes the heal event
  decomposeHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (target === null) {
      return null;
    }
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    return this._decompHeal(healVal, this.getHotCount(target));
  }

  /**
   * Decomposes a heal's amount to show the amounts attributable to mastery
   * @param healVal the HealingValue being decomposed
   * @param hotCount the number of HoTs present on the target which provide Mastery boost
   */
  _decompHeal(healVal: HealingValue, hotCount: number): DecomposedHeal {
    const masteryBonus = this.statTracker.currentMasteryPercentage;
    const healMasteryMult = 1 + hotCount * masteryBonus;

    const rawNoMasteryHealing = healVal.raw / healMasteryMult;
    const noMasteryHealing = Math.min(rawNoMasteryHealing, healVal.effective);

    // because Mastery is a bonus on top of the base healing, all overhealing is counted against Mastery
    const effectiveMasteryHealing = healVal.effective - noMasteryHealing;
    // when Mastery bonus is partially but not completely overhealing, the stacks equally share attribution
    const oneStackMasteryHealingEffective = effectiveMasteryHealing / hotCount;

    const oneStackMasteryHealingRaw = rawNoMasteryHealing * masteryBonus;
    // the number of mastery stacks that we actually benefitted from once overheal is considered.
    // if this heal didn't overheal at all, will be the same as hotCount
    const effectiveStackBenefit = effectiveMasteryHealing / oneStackMasteryHealingRaw;

    const relativeBuffBenefit = (buffRating: number) => {
      const buffBonus =
        (hotCount * buffRating) /
        this.statTracker.ratingNeededForNextPercentage(
          this.statTracker.currentMasteryRating,
          this.statTracker.statBaselineRatingPerPercent[STAT.MASTERY],
          this.selectedCombatant.spec.masteryCoefficient,
        );
      return buffBonus / healMasteryMult;
    };

    return {
      noMastery: noMasteryHealing,
      oneStack: oneStackMasteryHealingEffective,
      effectiveStackBenefit,
      relativeBuffBenefit,
    };
  }
}

/**
 * A mapping from spell guid to the MasteryAttribution for that spell
 */
export type MasteryAttributionsBySpell = { [key: string]: MasterySpellAttribution };

/**
 * A HoT's mastery attribution.
 */
export class MasterySpellAttribution {
  direct: number; // the direct healing from the HoT, should be same as entry in WCL. Includes benefit from own stack of Mastery.
  mastery: { [key: string]: number }; // a mapping from spell ID to how much this HoT boosted it via Mastery.

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
export type MasteryAttributionsByBuff = { [key: string]: MasteryBuffAttribution };

/**
 * A Buff's mastery attribution.
 */
export class MasteryBuffAttribution {
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
export interface DecomposedHeal {
  noMastery: number; // the amount the heal would have done without being boosted by mastery
  oneStack: number; // the amount of *effective* heal added per stack of mastery
  effectiveStackBenefit: number; // the number of mastery stacks that we actually benefitted from once overheal is considered.
  relativeBuffBenefit: (rating: number) => number; // a function that takes a mastery buff rating as input and outputs the healing attributable to that buff
}

export default Mastery;
