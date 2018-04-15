import SPELLS from 'common/SPELLS';

import BaseHealerStatValues from 'Parser/Core/Modules/Features/BaseHealerStatValues';
import STAT from 'Parser/Core/Modules/Features/STAT';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import SPELL_INFO from './StatValuesSpellInfo';
import MasteryEffectiveness from './MasteryEffectiveness';

const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME = 200; // if someone heals with FoL and then immediately casts a HS race conditions may occur. This prevents that (although the buff is probably not applied before the FoL).
const INFUSION_OF_LIGHT_FOL_HEALING_INCREASE = 0.5;

/**
 * Holy Paladin Stat Values Methodology
 *
 * A full explanation of this approach can be read in the issue linked below. This was written for theorycrafters without needing to understand code.
 * (but it might be outdated, that's always the risk of documentation)
 * https://github.com/WoWAnalyzer/WoWAnalyzer/issues/657
 */
class StatValues extends BaseHealerStatValues {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    masteryEffectiveness: MasteryEffectiveness, // this added the `masteryEffectiveness` property to spells that are affected by Mastery
  };

  spellInfo = SPELL_INFO;

  on_heal(event) {
    if (event.ability.guid === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      // Handle this via the `on_beacon_heal` event
      return;
    }
    super.on_heal(event);
  }
  on_beacon_heal(event) {
    const spellInfo = this._getSpellInfo(event.originalHeal);
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const targetHealthPercentage = (event.hitPoints - healVal.effective) / event.maxHitPoints; // hitPoints contains HP *after* the heal
    this._handleHeal(spellInfo, event.originalHeal, healVal, targetHealthPercentage);
  }
  _getCritChance(event) {
    const spellId = event.ability.guid;

    let { baseCritChance, ratingCritChance } = super._getCritChance(event);

    if (this.combatants.selected.hasBuff(SPELLS.AVENGING_WRATH.id)) {
      // Avenging Wrath increases the crit chance by 20%, this 20% does not add to the rating contribution since it's unaffected by stats.
      baseCritChance += 0.2;
    }
    if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
      // Holy Shock *doubles* the crit chance, this includes doubling the base.
      baseCritChance *= 2;
      ratingCritChance *= 2;
    }

    return { baseCritChance, ratingCritChance };
  }
  _criticalStrike(event, healVal) {
    return super._criticalStrike(event, healVal) + this._criticalStrikeInfusionOfLightProcs(event, healVal);
  }
  _criticalStrikeInfusionOfLightProcs(event, healVal) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id && spellId !== SPELLS.HOLY_LIGHT.id) {
      return 0;
    }
    const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, event.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME);
    if (!hasIol) {
      return 0;
    }

    if (spellId === SPELLS.FLASH_OF_LIGHT.id) {
      const regularHeal = healVal.raw / (1 + INFUSION_OF_LIGHT_FOL_HEALING_INCREASE);
      const effectiveIolHealing = Math.max(0, healVal.effective - regularHeal);

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (totalCritChance > (1 + 1 / this.statTracker.critRatingPerPercent)) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return 0;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      return effectiveIolHealing * ratingCritChanceContribution / this.statTracker.currentCritRating;
    }
    if (spellId === SPELLS.HOLY_LIGHT.id) {
      // TODO: We might be able to use the Haste stat value to value the CDR
      return 0;
    }
  }
  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    if (event.masteryEffectiveness === undefined) {
      console.error('This spell does not have a known masteryEffectiveness:', event.ability.guid, event.ability.name);
      return 0;
    }

    const masteryEffectiveness = event.masteryEffectiveness;
    const healIncreaseFromOneMastery = 1 / this.statTracker.masteryRatingPerPercent * masteryEffectiveness;
    const baseHeal = healVal.effective / (1 + this.statTracker.currentMasteryPercentage * masteryEffectiveness);

    return baseHeal * healIncreaseFromOneMastery;
  }

  moreInformationLink = 'https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Paladin/Holy/Modules/Features/StatValues.md';
  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      {
        stat: STAT.HASTE_HPCT,
        tooltip: `
          HPCT stands for "Healing per Cast Time". This is the max value that 1% Haste would be worth if you would cast everything you are already casting and that can be casted quicker 1% faster. Mana and overhealing are not accounted for in any way.<br /><br />
          
          The real value of Haste (HPCT) will be between 0 and the shown value. It depends on if you have the mana left to spend, if the gained casts would overheal and how well you are at casting spells limited by Hasted cooldowns end-to-end. If you are going OOM before the end of the fight you might instead want to drop some Haste or cast less bad heals. If you had mana left-over, Haste could help you convert that into healing. If your Haste usage is optimal Haste will then be worth the shown max value.<br /><br />
          
          If there are intense moments of damage taken where people are dying due to lack of healing and you're GCD capped, Haste might also help increase your throughput during this period saving lifes and helping you kill the boss.<br /><br />
          
          <b>The easiest advice here is to get Haste to a point you're comfortable at. This is usually around 5-9%.</b>
        `,
      },
      // STAT.HASTE_HPM, this is always 0 for Holy Paladins
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }
}

export default StatValues;
