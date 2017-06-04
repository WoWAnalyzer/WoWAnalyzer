import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

import {ABILITIES_AFFECTED_BY_HEALING_INCREASES} from '../../Constants';

const debug = false;
const WG_TARGETS = 6;
const REJUV_BASE_MANA = 10;
const REJUVENATION_REDUCED_MANA = 0.3;
const HEALING_INCREASE = 1.15;
const REJUV_HEALING_INCREASE = 1.5;
const WILD_GROWTH_HEALING_INCREASE = (WG_TARGETS+2) / WG_TARGETS;

class TreeOfLife extends Module {
  hasGermination = false;
  totalHealingEncounter = 0;
  totalHealingDuringToL = 0;
  totalHealingFromRejuvenationDuringToL = 0;
  totalHealingFromRejuvenationEncounter = 0;
  totalRejuvenationsEncounter = 0;
  totalRejuvenationsDuringToL = 0;
  totalHealingFromWildgrowthsDuringToL = 0;
  throughput = 0;
  tolManualApplyTimestamp = null;
  tolCasts = 0;

  // Chameleon song
  totalHealingDuringToLHelmet = 0;
  totalHealingFromRejuvenationDuringToLHelmet = 0;
  totalRejuvenationsDuringToLHelmet = 0;
  totalHealingFromWildgrowthsDuringToLHelmet = 0;
  throughputHelmet = 0;

  on_initialized() {
    this.hasGermination = this.owner.selectedCombatant.lv90Talent === SPELLS.GERMINATION_TALENT.id;
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    // Get total healing from rejuv + germ (if specced).
    if (SPELLS.REJUVENATION.id === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    } else if(this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    }

    // Get total healing from rejuv + germ (if specced) during ToL
    if(this.owner.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)){
      if(this.tolManualApplyTimestamp !== null && event.timestamp<=this.tolManualApplyTimestamp+30000) {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToL += event.amount;
        } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToL += event.amount;
        } else if (SPELLS.WILD_GROWTH.id === spellId) {
          this.totalHealingFromWildgrowthsDuringToL += event.amount;
        }
        // Get total healing during ToL
        this.totalHealingDuringToL += event.amount;
      } else {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToLHelmet += event.amount;
        } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToLHelmet += event.amount;
        } else if (SPELLS.WILD_GROWTH.id === spellId) {
          this.totalHealingFromWildgrowthsDuringToLHelmet += event.amount;
        }
        // Get total healing during ToL
        this.totalHealingDuringToLHelmet += event.amount;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.REJUVENATION.id === spellId) {
      this.totalRejuvenationsEncounter++;
    }
    if(this.owner.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)){
      if(this.tolManualApplyTimestamp !== null && event.timestamp<=this.tolManualApplyTimestamp+30000) {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalRejuvenationsDuringToL++;
        }
      } else {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalRejuvenationsDuringToLHelmet++;
        }
      }
    }
    if(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id === spellId) {
      this.tolManualApplyTimestamp = event.timestamp;
      this.tolCasts++;
    }
  }

  on_finished() {
    // Encounter finished, let's tie up the variables
    this.totalHealingEncounter = this.owner.totalHealing;
    debug && console.log("Has germination: " + this.hasGermination);
    debug && console.log("Total healing encounter: " + this.totalHealingEncounter);
    debug && console.log("Total healing during ToL: " + this.totalHealingDuringToL);
    debug && console.log("Total healing from rejuvenation encounter: " + this.totalHealingFromRejuvenationEncounter);
    debug && console.log("Total healing from rejuvenation during ToL: " + this.totalHealingFromRejuvenationDuringToL);
    debug && console.log("Total rejuvenation casted encounter: " + this.totalRejuvenationsEncounter);
    debug && console.log("Total rejuvenation casted during ToL: " + this.totalRejuvenationsDuringToL);
    debug && console.log("Total healing from wild growth during ToL: " + this.totalHealingFromWildgrowthsDuringToL);

    // Get 1 rejuv throughput worth
    let oneRejuvenationThroughput = (((this.totalHealingFromRejuvenationEncounter / this.totalHealingEncounter))/this.totalRejuvenationsEncounter);
    debug && console.log("1 Rejuvenation throughput: " + (oneRejuvenationThroughput*100).toFixed(2)+"%");

    // 50% of total healing from rejuv+germ during ToL and divide it with the encounter total healing.
    let rejuvenationIncreasedEffect = (this.totalHealingFromRejuvenationDuringToL/HEALING_INCREASE - this.totalHealingFromRejuvenationDuringToL / (HEALING_INCREASE * REJUV_HEALING_INCREASE))/ this.totalHealingEncounter;
    debug && console.log("rejuvenationIncreasedEffect: " + (rejuvenationIncreasedEffect*100).toFixed(2)+"%");

    // 15% of total healing during ToL and divide it with the encounter total healing
    let tolIncreasedHealingDone = (this.totalHealingDuringToL - this.totalHealingDuringToL/HEALING_INCREASE)/this.totalHealingEncounter;
    debug && console.log("tolIncreasedHealingDone: " + (tolIncreasedHealingDone*100).toFixed(2)+"%");

    // The amount of free rejuvs gained by the reduced mana cost, calculated into throughput by the "1 Rejuv throughput worth"
    let rejuvenationMana = (((this.totalRejuvenationsDuringToL * REJUV_BASE_MANA) * REJUVENATION_REDUCED_MANA) / REJUV_BASE_MANA) * oneRejuvenationThroughput;
    debug && console.log("rejuvenationMana: " + (rejuvenationMana*100).toFixed(2)+"%");

    // 33% of total healing from WG during ToL and divide it with the encounter total healing.
    let wildGrowthIncreasedEffect = (this.totalHealingFromWildgrowthsDuringToL/HEALING_INCREASE - this.totalHealingFromWildgrowthsDuringToL/(HEALING_INCREASE * WILD_GROWTH_HEALING_INCREASE)) / this.totalHealingEncounter;
    debug && console.log("wildGrowthIncreasedEffect: " + (wildGrowthIncreasedEffect*100).toFixed(2)+"%");

    // Total throughput from using Tree of Life
    this.throughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;
    debug && console.log("uptime: " + ((this.owner.selectedCombatant.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)/this.owner.fightDuration)*100).toFixed(2)+"%");
    debug && console.log("throughput: " + (this.throughput*100).toFixed(2)+"%");

    // Chameleon song
    let rejuvenationIncreasedEffectHelmet = (this.totalHealingFromRejuvenationDuringToLHelmet/HEALING_INCREASE - this.totalHealingFromRejuvenationDuringToLHelmet / (HEALING_INCREASE * REJUV_HEALING_INCREASE))/ this.totalHealingEncounter;
    debug && console.log("rejuvenationIncreasedEffectHelmet: " + (rejuvenationIncreasedEffectHelmet*100).toFixed(2)+"%");
    let tolIncreasedHealingDoneHelmet = (this.totalHealingDuringToLHelmet - this.totalHealingDuringToLHelmet/HEALING_INCREASE)/this.totalHealingEncounter;
    debug && console.log("tolIncreasedHealingDone: " + (tolIncreasedHealingDoneHelmet*100).toFixed(2)+"%");
    let rejuvenationManaHelmet = (((this.totalRejuvenationsDuringToLHelmet * REJUV_BASE_MANA) * REJUVENATION_REDUCED_MANA) / REJUV_BASE_MANA) * oneRejuvenationThroughput;
    debug && console.log("rejuvenationManaHelmet: " + (rejuvenationManaHelmet*100).toFixed(2)+"%");
    let wildGrowthIncreasedEffectHelmet = (this.totalHealingFromWildgrowthsDuringToLHelmet/HEALING_INCREASE - this.totalHealingFromWildgrowthsDuringToLHelmet/(HEALING_INCREASE * WILD_GROWTH_HEALING_INCREASE)) / this.totalHealingEncounter;
    debug && console.log("wildGrowthIncreasedEffectHelmet: " + (wildGrowthIncreasedEffectHelmet*100).toFixed(2)+"%");
    this.throughputHelmet = rejuvenationIncreasedEffectHelmet + tolIncreasedHealingDoneHelmet + rejuvenationManaHelmet + wildGrowthIncreasedEffectHelmet;
    debug && console.log("uptimeHelmet: " + (((this.owner.selectedCombatant.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)-(this.tolCasts*30000))/this.owner.fightDuration)*100).toFixed(2)+"%");
    debug && console.log("throughputHelmet: " + (this.throughputHelmet*100).toFixed(2)+"%");

  }
}

export default TreeOfLife;
