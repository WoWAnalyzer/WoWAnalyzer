import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import { getSpellInfo } from '../../SpellInfo';

const DEBUG = true;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int
const BASE_CRIT_MULTIPLIER = 2;

class StatWeights extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  critMultiplier = BASE_CRIT_MULTIPLIER; // TODO handle Tauren / DoS?

  totalNonIgnoredHealing = 0;

  totalOneInt = 0;
  totalOneCrit = 0;
  totalOneHasteHpm = 0;
  totalOneHasteHpct = 0;
  totalOneMastery = 0;
  totalOneVers = 0;

  on_initialized() {
    // TODO do I have to set anything here?
  }

  on_byPlayer_heal(event) {
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    _handleHeal(event, healVal);
  }

  on_byPlayer_absorbed(event) {
    const healVal = new HealingValue(event.amount, 0, 0);
    _handleHeal(event, healVal);
  }

  _handleHeal(event, healVal) {
    const spellInfo = getSpellInfo(event.ability.guid);
    if(spellInfo.ignored) {
      return;
    }

    this.totalNonIgnoredHealing += healVal.effective;
    if(healVal.overheal) {
      return; // if a spell overheals, we know it couldn't have healed for more
    }

    const hotCount = this.combatants.getEntity(event).activeBuffs()
        .map(buffObj => buffObj.ability.guid)
        .filter(buffId => getSpellInfo(buffId).masteryStack)
        .length;
    //const decomposedHeal = this._decompHeal(spellInfo, healVal.effective, hotCount, (event.hitType === 2));
    const amount = healVal.effective;

    // INT //
    let oneInt = 0;
    if(spellInfo.int) {
      const currInt = this.combatants.selected.intellect; // TODO replace when dynamic stats
      const bonusFromOneInt = (1 / currInt) * ARMOR_INT_MULTIPLIER;
      oneInt = amount * bonusFromOneInt;
    }

    // CRIT //
    let oneCrit = 0;
    if(spellInfo.crit) {
      const currCritPerc = this.combatants.selected.critPercentage; // TODO replace when dynamic stats
      const bonusFromOneCrit = 1 / 40000; // TODO replace when stat constants exist
      if(spellInfo.isLivingSeed) {
        const additionalLivingSeedChance = bonusFromOneCrit / currCritPerc;
        oneCrit = additionalLivingSeedChance * amount;
      } else {
        const noCritHealing = event.hitType === HIT_TYPES.CRIT ? amount / this.critMultiplier : amount;
        oneCrit = noCritHealing * bonusFromOneCrit * (this.critMultiplier - 1);
      }
    }

    // HASTE //
    let oneHasteHpm = 0;
    let oneHasteHpct = 0;
    // TODO pls no

    // MASTERY //
    let oneMastery = 0;
    if(spellInfo.mastery) {
      const currMasteryPerc = this.combatants.selected.masteryPercentage; // TODO replace when dynamic stats
      const bonusFromOneMastery = 1 / 66666; // TODO replace when stat constants exist
      const noMasteryHealing = amount / (1 + (currMasteryPerc * hotCount));
      oneMastery = noMasteryHealing * bonusFromOneMastery * hotCount;
    }

    // VERS //
    let oneVers = 0;
    if(spellInfo.vers) {
      const currVersPerc = this.combatants.selected.versatilityPercentage; // TODO replace when dynamic stats
      const bonusFromOneVers = 1 / 47500; // TODO replace when stat constants exist
      const noVersHealing = amount / (1 + currVersPerc);
      oneVers = noVersHealing * bonusFromOneVers;
    }

    this.totalOneInt += oneInt;
    this.totalOneCrit += oneCrit;
    this.totalOneHasteHpm += oneHasteHpm;
    this.totalOneHasteHpct += oneHasteHpct;
    this.totalOneMastery += oneMastery;
    this.totalOneVers += oneVers;
  }

  on_finished() {
    if(debug) {
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Crit - ${formatNumber(this.totalOneInt)}`);
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
    }
  }

  // TODO output? Or just expose values and let other module show?
}

export default StatWeights;
