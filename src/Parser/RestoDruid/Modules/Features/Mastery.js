import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';
import { HEALS_MASTERY_STACK } from '../../Constants';

const MASTERY_BONUS_FROM_ONE_RATING = 1 / 66666.6666666;
const BASE_MASTERY_PERCENT = 0.048;

class Mastery extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  hotHealing = {};
  masteryBuffs = {};

  on_initialized() {
    HEALS_MASTERY_STACK.forEach(healId => this.hotHealing[healId] = { direct: 0, mastery: 0 });

    this.masteryBuffs = {
      [SPELLS.ASTRAL_HARMONY.id]: { amount: 4000 },
      [SPELLS.JACINS_RUSE.id]: { amount: 3000 },
    };
    Object.values(this.masteryBuffs).forEach(entry => entry.attributableHealing = 0);
  }

  // TODO handle pre proc mastery buffs? Looks like pre-hots are already handled by the system.

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const amount = event.amount + (event.absorbed || 0);

    if (target === null) {
      return;
    }

    if (spellId in this.hotHealing) { this.hotHealing[spellId].direct += amount; }

    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      const hotsOn = target.activeBuffs()
          .map(buffObj => buffObj.ability.guid)
          .filter(buffId => HEALS_MASTERY_STACK.includes(buffId));
      const numHotsOn = hotsOn.length;
      const decomposedHeal = this._decompHeal(amount, numHotsOn);

      this.totalNoMasteryHealing += decomposedHeal.noMastery;
      this.druidSpellNoMasteryHealing += decomposedHeal.noMastery;
      this.masteryTimesHealing += decomposedHeal.noMastery * numHotsOn;

      hotsOn
          .filter(hotOn => hotOn !== spellId) // don't double count
          .forEach(hotOn => this.hotHealing[hotOn].mastery += decomposedHeal.oneStack);

      Object.entries(this.masteryBuffs)
          .filter(entry => this.combatants.selected.hasBuff(entry[0]))
          .forEach(entry => entry[1].attributableHealing += decomposedHeal.oneRating * entry[1].amount);
    } else {
      this.totalNoMasteryHealing += amount;
    }
  }

  on_byPlayer_absorbed(event) {
    this.totalNoMasteryHealing += event.amount;
  }

  /* accessors for computed values */

  getDirectHealing(healId) {
    return this.hotHealing[healId].direct;
  }

  getMasteryHealing(healId) {
    return this.hotHealing[healId].mastery;
  }

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

  _decompHeal(amount, hotCount) {
    const masteryBonus = this._getCurrMasteryBonus();
    const healMasteryMult = 1 + (hotCount * masteryBonus);

    const noMasteryHealing = amount / healMasteryMult;
    const oneStackMasteryHealing = noMasteryHealing * masteryBonus;
    const oneRatingMasteryHealing = noMasteryHealing * MASTERY_BONUS_FROM_ONE_RATING * hotCount;

    return {
      noMastery: noMasteryHealing,
      oneStack: oneStackMasteryHealing,
      oneRating: oneRatingMasteryHealing,
    };
  }

  _getCurrMasteryBonus() {
    let currMasteryRating = this.combatants.selected.masteryRating;
    Object.entries(this.masteryBuffs)
        .filter(entry => this.combatants.selected.hasBuff(entry[0]))
        .forEach(entry => currMasteryRating += entry[1].amount);
    return BASE_MASTERY_PERCENT + (currMasteryRating * MASTERY_BONUS_FROM_ONE_RATING);
  }
}

export default Mastery;
