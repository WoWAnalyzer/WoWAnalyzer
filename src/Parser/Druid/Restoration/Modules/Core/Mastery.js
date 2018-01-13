import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { getSpellInfo, DRUID_HEAL_INFO } from '../../SpellInfo';

class Mastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  /*
   * Keeps track of the attribution of healing done by your hots. Each spellId gets an entry with a 'direct' and 'mastery' field.
   * The 'direct' field just tracks the direct healing from the HoT, should be same as entry in WCL. Includes the benefit from own stack of Mastery.
   * The 'mastery' field tracks which spells were boosted by the presence of this HoT, and by how much.
   * The total healing attributable to the presence of the HoT is the sum of the direct field and all the attributions in the mastery field.
   * While the attribution to any one HoT is correctly counted by simply summing, there are double counts when considering multiple HoTs together.
   */
  hotHealingAttrib = {};

  /*
   * Tracks healing attributable to mastery buffs
   */
  masteryBuffs = {};

  on_initialized() {
    Object.entries(DRUID_HEAL_INFO)
        .filter(infoEntry => infoEntry[1].masteryStack)
        .forEach(infoEntry => this.hotHealingAttrib[infoEntry[0]] = { direct: 0, mastery: {} });

    // TODO hook in StatTracker buff list somehow, so new Mastery buffs auto handled?
    this.masteryBuffs = {
      [SPELLS.ASTRAL_HARMONY.id]: { amount: 4000 },
      [SPELLS.JACINS_RUSE.id]: { amount: 3000 },
    };
    Object.values(this.masteryBuffs).forEach(entry => entry.attributableHealing = 0);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);

    if (target === null) {
      return;
    }

    if (spellId in this.hotHealingAttrib) { this.hotHealingAttrib[spellId].direct += healVal.effective; }

    if (getSpellInfo(spellId).mastery) {
      const hotsOn = this.getHotsOn(target);
      const numHotsOn = hotsOn.length;
      const decomposedHeal = this._decompHeal(healVal, numHotsOn);

      this.totalNoMasteryHealing += decomposedHeal.noMastery;
      this.druidSpellNoMasteryHealing += decomposedHeal.noMastery;
      this.masteryTimesHealing += decomposedHeal.noMastery * decomposedHeal.effectiveStackBenefit;

      hotsOn
          .filter(hotOn => hotOn !== spellId) // don't double count
          .forEach(hotOn => this._tallyMasteryBenefit(hotOn, spellId, decomposedHeal.oneStack));

      Object.entries(this.masteryBuffs)
          .filter(entry => this.combatants.selected.hasBuff(entry[0]))
          .forEach(entry => entry[1].attributableHealing +=
              calculateEffectiveHealing(event, decomposedHeal.relativeBuffBenefit(entry[1].amount)));
    } else {
      this.totalNoMasteryHealing += healVal.effective;
    }
  }

  on_byPlayer_absorbed(event) {
    this.totalNoMasteryHealing += event.amount;
  }

  /* accessors for computed values */

  /*
   * Gets the direct healing attributed to the given resto HoT ID
   */
  getDirectHealing(healId) {
    return this.hotHealingAttrib[healId].direct;
  }

  /*
   * Gets the total mastery healing attributed to the given resto HoT ID
   */
  getMasteryHealing(healId) {
    return Object.values(this.hotHealingAttrib[healId].mastery)
        .reduce((s, v) => s + v, 0);
  }

  /*
   * Gets the total healing attributable to the given resto HoT IDs.
   * Counts both direct and by mastery, and avoids the mastery/direct double count issue between the hots.
   */
  getMultiMasteryHealing(healIds) {
    let total = 0;
    healIds.forEach(healId => {
      total += Object.entries(this.hotHealingAttrib[healId].mastery)
        .filter(entry => !healIds.includes(parseInt(entry[0], 10)))
        .reduce((sum, entry) => sum + entry[1], 0);
      total += this.hotHealingAttrib[healId].direct;
    });
    return total;
  }

  /*
   * Gets detailed direct / mastery healing attribution info from the given resto HoT ID
   */
  getHealingDetails(healId) {
    return this.hotHealingAttrib[healId];
  }

  /*
   * Gets the total mastery healing attributed to the given mastery buff ID
   */
  getBuffBenefit(buffId) {
    return this.masteryBuffs[buffId].attributableHealing;
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
   * Given an Entity object, returns an array of the spell IDs of the Mastery boosting HoTs the Druid currently has on that target.
   */
  getHotsOn(target) {
    return target.activeBuffs()
        .map(buffObj => buffObj.ability.guid)
        .filter(buffId => getSpellInfo(buffId).masteryStack);
  }

  /**
   * Given an Entity object, returns the number of Mastery boosting HoTs the Druid currently has on that target.
   */
  getHotCount(target) {
    return this.getHotsOn(target).length;
  }

  _tallyMasteryBenefit(hotId, healId, amount) {
    const hotMastery = this.hotHealingAttrib[hotId].mastery;
    if(hotMastery[healId]) {
      hotMastery[healId] += amount;
    } else {
      hotMastery[healId] = amount;
    }
  }

  // a version of _decompHeal for call by external modules, takes the heal event
  decomposeHeal(event) {
    const target = this.combatants.getEntity(event);
    if (target === null) {
      return null;
    }
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    return this._decompHeal(healVal, this.getHotCount(target));
  }

  _decompHeal(healVal, hotCount) {
    const masteryBonus = this.statTracker.currentMasteryPercentage;
    const healMasteryMult = 1 + (hotCount * masteryBonus);

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

    const relativeBuffBenefit = (buffRating => {
      const buffBonus = hotCount * buffRating / this.statTracker.masteryRatingPerPercent;
      return buffBonus / healMasteryMult;
    });

    return {
      noMastery: noMasteryHealing,
      oneStack: oneStackMasteryHealingEffective,
      effectiveStackBenefit: effectiveStackBenefit,
      relativeBuffBenefit: relativeBuffBenefit,
    };
  }
}

export default Mastery;
