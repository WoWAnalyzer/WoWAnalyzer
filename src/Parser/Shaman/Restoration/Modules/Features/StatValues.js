import SPELLS from 'common/SPELLS';

import BaseHealerStatValues from 'Parser/Core/Modules/Features/BaseHealerStatValues';
import STAT from 'Parser/Core/Modules/Features/STAT';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';

import SPELL_INFO from './StatValuesSpellInfo';
import MasteryEffectiveness from './MasteryEffectiveness';

/**
 * Restoration Shaman Stat Values
 */

 const BUFFER_MS = 100;
 const MINIMUM_GCD = 750;

class StatValues extends BaseHealerStatValues {
  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    masteryEffectiveness: MasteryEffectiveness,
  };

  spellInfo = SPELL_INFO;

  on_feed_heal(event) {
    const spellInfo = this._getSpellInfo(event);
    const healVal = new HealingValue(event.feed, 0, 0);
    const targetHealthPercentage = (event.hitPoints - event.amount) / event.maxHitPoints; // hitPoints contains HP *after* the heal
    this._handleHeal(spellInfo, event, healVal, targetHealthPercentage);
  }

  // calculating the value of QA (cast speed to your next direct heal after a crit) just like HPCT, but giving the cast speed value to crit instead
  queenAscendantTrait(event, healVal) {
    const spellId = event.ability.guid;
    const spellInfo = this._getSpellInfo(event);
    // checking for quite a big buffer as the buffs can run out mid cast but still apply
    const hasQueensAscendant = this.combatants.selected.hasBuff(SPELLS.QUEEN_ASCENDANT_BUFF.id, event.timestamp, MINIMUM_GCD, BUFFER_MS);
    const hasTidalWaves = this.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, MINIMUM_GCD, BUFFER_MS);
    
    // disregard wave casts with tidal waves as its always below GCD regardless of QA (and neither change the GCD itself)
    if(spellId === SPELLS.HEALING_WAVE.id && hasTidalWaves){
      return 0;
    }
    
    if (!spellInfo.hasteHpct || !hasQueensAscendant) {
      return 0;
    }

    const currHastePerc = this.statTracker.currentHastePercentage;
    const queenAscendantTraits = this.combatants.selected.traitsBySpellId[SPELLS.QUEEN_ASCENDANT_TRAIT.id];
    const queenAscendantReduction = queenAscendantTraits * 0.05;
    const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;
    const baseHeal = (healVal.effective / (1 - queenAscendantReduction) - healVal.effective) / (1 + currHastePerc);

    return baseHeal * healIncreaseFromOneHaste;
  }

  _getCritChance(event) {
    const spellId = event.ability.guid;
    const critChanceBreakdown = super._getCritChance(event);

    // Traits that increase the base crit chance of spells
    const traitLevelEmpoweredDroplets = this.combatants.selected.traitsBySpellId[SPELLS.EMPOWERED_DROPLETS.id];
    const traitLevelFloodwaters = this.combatants.selected.traitsBySpellId[SPELLS.FLOODWATERS.id];
    const traitLevelTidalChains = this.combatants.selected.traitsBySpellId[SPELLS.TIDAL_CHAINS.id];
    // Tidal Waves add 40% crit + 4% for every tidal chains trait to Healing Surge
    const hasTidalWaves = this.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

    if (spellId === SPELLS.HEALING_RAIN_HEAL.id) {
      critChanceBreakdown.baseCritChance += traitLevelEmpoweredDroplets * 0.02;
    }
    if (spellId === SPELLS.CHAIN_HEAL.id) {
      critChanceBreakdown.baseCritChance += traitLevelFloodwaters * (0.1 / 3); // 0.0333...
    }
    if (spellId === SPELLS.HEALING_SURGE_RESTORATION.id && hasTidalWaves) {
      critChanceBreakdown.baseCritChance += 0.4 + 0.04 * traitLevelTidalChains;
    }

    return critChanceBreakdown;
  }

  _criticalStrike(event, healVal) {
      return super._criticalStrike(event, healVal) + this.queenAscendantTrait(event,healVal);
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

  _prepareResults() {
    return [
      STAT.INTELLECT,
      {
        stat: STAT.CRITICAL_STRIKE,
        tooltip: `
          Weight does not include Resurgence mana gain.
        `,
      },
      {
        stat: STAT.HASTE_HPCT,
        tooltip: `
          HPCT stands for "Healing per Cast Time". This is the max value that 1% Haste would be worth if you would cast everything you are already casting and that can be casted quicker 1% faster. Mana and overhealing are not accounted for in any way.<br /><br />
          
          The real value of Haste (HPCT) will be between 0 and the shown value. It depends on if you have the mana left to spend, if the gained casts would overheal and how well you are at casting spells limited by Hasted cooldowns end-to-end. If you are going OOM before the end of the fight you might instead want to drop some Haste or cast less bad heals. If you had mana left-over, Haste could help you convert that into healing. If your Haste usage is optimal Haste will then be worth the shown max value.<br /><br />
          
          If there are intense moments of damage taken where people are dying due to lack of healing and you're GCD capped, Haste might also help increase your throughput during this period saving lifes and helping you kill the boss.
        `,
      },
      STAT.HASTE_HPM,
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }
}

export default StatValues;
