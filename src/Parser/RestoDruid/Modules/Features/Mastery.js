import {formatPercentage} from 'common/format';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import {ABILITIES_AFFECTED_BY_HEALING_INCREASES} from '../../Constants';
import {HEALS_MASTERY_STACK} from '../../Constants';

const MASTERY_BONUS_FROM_ONE_RATING = 1 / 66666.6666666;
const BASE_MASTERY_PERCENT = 0.048;

class Mastery extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  hotHealingMap = null;
  masteryBuffs = null;

  on_initialized() {
    // TODO use JS objects instead of Maps for hotHealingMap and masteryBuffs?
    this.hotHealingMap = new Map();
    for(const healId of HEALS_MASTERY_STACK) {
      this.hotHealingMap.set(healId, {'name':SPELLS[healId].name, 'direct':0, 'mastery':0});
    }

    this.masteryBuffs = new Map([
        [ SPELLS.ASTRAL_HARMONY.id, { 'spell':SPELLS.ASTRAL_HARMONY, 'amount':4000 } ],
        [ SPELLS.JACINS_RUSE.id, { 'spell':SPELLS.JACINS_RUSE, 'amount':3000 } ],
    ]);
    for(const buffObj of this.masteryBuffs.values()) {
  		buffObj.attributableHealing = 0;
  	}
  }

  // TODO handle pre proc mastery buffs? Looks like pre-hots are already handled by the system.

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const amount = event.amount + (event.absorbed === undefined ? 0 : event.absorbed);

    if(target === null) {
      return;
    }

    if(this.hotHealingMap.has(spellId)) {
      this.hotHealingMap.get(spellId).direct += amount;
    }

    if(ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
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
          .forEach(hotOn => this.hotHealingMap.get(hotOn).mastery += decomposedHeal.oneStack);

/*
      for(let hotOn of hotsOn) {
        if(hotOn != spellId) { // don't double count
          this.hotHealingMap.get(hotOn).mastery += decomposedHeal.oneStack;
        }
      }
*/

      // TODO implement this part functionally too
      for(const [buffId, buffObj] of this.masteryBuffs.entries()) {
        if(this.combatants.selected.hasBuff(buffId)) {
          const attributableHealing = decomposedHeal.oneRating * buffObj.amount;
          buffObj.attributableHealing += attributableHealing;
        }
      }

    } else {
      this.totalNoMasteryHealing += amount;
    }
  }

  on_byPlayer_absorbed(event) {
    this.totalNoMasteryHealing += event.amount;
  }

  on_finished() {
    console.log("Mastery results: ");
    for(const hotObj of this.hotHealingMap.values()) {
      const directPerc = this.owner.getPercentageOfTotalHealingDone(hotObj.direct);
      const masteryPerc = this.owner.getPercentageOfTotalHealingDone(hotObj.mastery);
      console.log(hotObj.name + " - Direct:" + formatPercentage(directPerc) +
          "% Mastery:" + formatPercentage(masteryPerc) + "%");
    }

    const avgMasteryStacksAllHealing = this.masteryTimesHealing / this.totalNoMasteryHealing;
    const avgMasteryStacksDruidHealing = this.masteryTimesHealing / this.druidSpellNoMasteryHealing;

    console.log("Avg Mastery Stacks - All Healing:" + avgMasteryStacksAllHealing + " Druid Healing:" + avgMasteryStacksDruidHealing);
  }

  /* accessors for computed values */

  getDirectHealing(healId) {
    return this.hotHealingMap.get(healId).direct;
  }

  getMasteryHealing(healId) {
    return this.hotHealingMap.get(healId).mastery;
  }

  getBuffBenefit(buffId) {
    return this.masteryBuffs.get(buffId).attributableHealing;
  }

  _decompHeal(amount, hotCount) {
    const masteryBonus = this._getCurrMasteryBonus();
    const healMasteryMult = 1 + (hotCount * masteryBonus);

    const noMasteryHealing = amount / healMasteryMult;
    const oneStackMasteryHealing = noMasteryHealing * masteryBonus;
    const oneRatingMasteryHealing = noMasteryHealing * MASTERY_BONUS_FROM_ONE_RATING * hotCount;

    return {
      'noMastery': noMasteryHealing,
      'oneStack': oneStackMasteryHealing,
      'oneRating': oneRatingMasteryHealing,
    };
  }

  _getCurrMasteryBonus() {
    let baseMasteryRating = this.combatants.selected.masteryRating;
    for(const [buffId, buffObj] of this.masteryBuffs.entries()) {
      if(this.combatants.selected.hasBuff(buffId)) {
        baseMasteryRating += buffObj.amount;
      }
    }
    return BASE_MASTERY_PERCENT + (baseMasteryRating * MASTERY_BONUS_FROM_ONE_RATING);
  }

}

export default Mastery;
