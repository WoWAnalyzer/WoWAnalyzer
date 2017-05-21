import Module from 'Parser/Core/Module';
import { TREE_OF_LIFE_CAST_ID, REJUVENATION_GERMINATION_HEAL_SPELL_ID, REJUVENATION_HEAL_SPELL_ID, WILD_GROWTH_HEAL_SPELL_ID, ABILITIES_AFFECTED_BY_HEALING_INCREASES} from '../../Constants';

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

  on_initialized() {
    //Germination TODO: Refactor id
    this.hasGermination = this.owner.selectedCombatant.lv90Talent === 155675;
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    // Get total healing from rejuv + germ (if specced).
    if (REJUVENATION_HEAL_SPELL_ID === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    } else if(this.hasGermination && REJUVENATION_GERMINATION_HEAL_SPELL_ID === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    }

    // Get total healing from rejuv + germ (if specced) during ToL
    if(this.owner.selectedCombatant.hasBuff(TREE_OF_LIFE_CAST_ID)){
      if (REJUVENATION_HEAL_SPELL_ID === spellId) {
        this.totalHealingFromRejuvenationDuringToL += event.amount;
      } else if(this.hasGermination && REJUVENATION_GERMINATION_HEAL_SPELL_ID === spellId) {
        this.totalHealingFromRejuvenationDuringToL += event.amount;
      } else if(WILD_GROWTH_HEAL_SPELL_ID === spellId) {
        this.totalHealingFromWildgrowthsDuringToL += event.amount;
      }
      // Get total healing during ToL
      this.totalHealingDuringToL += event.amount;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (REJUVENATION_HEAL_SPELL_ID === spellId) {
      this.totalRejuvenationsEncounter++;
    }
    if(this.owner.selectedCombatant.hasBuff(TREE_OF_LIFE_CAST_ID)){
      if (REJUVENATION_HEAL_SPELL_ID === spellId) {
        this.totalRejuvenationsDuringToL++;
      }
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
    debug && console.log("1 Rejuvenation throughput: " + oneRejuvenationThroughput);

    // 50% of total healing from rejuv+germ during ToL and divide it with the encounter total healing.
    let rejuvenationIncreasedEffect = (this.totalHealingFromRejuvenationDuringToL/HEALING_INCREASE - this.totalHealingFromRejuvenationDuringToL / (HEALING_INCREASE * REJUV_HEALING_INCREASE))/ this.totalHealingEncounter;
    debug && console.log("rejuvenationIncreasedEffect: " + rejuvenationIncreasedEffect);

    // 15% of total healing during ToL and divide it with the encounter total healing
    let tolIncreasedHealingDone = (this.totalHealingDuringToL - this.totalHealingDuringToL/HEALING_INCREASE)/this.totalHealingEncounter
    debug && console.log("tolIncreasedHealingDone: " + tolIncreasedHealingDone);

    // The amount of free rejuvs gained by the reduced mana cost, calculated into throughput by the "1 Rejuv throughput worth"
    let rejuvenationMana = (((this.totalRejuvenationsDuringToL * REJUV_BASE_MANA) * REJUVENATION_REDUCED_MANA) / REJUV_BASE_MANA) * oneRejuvenationThroughput;
    debug && console.log("rejuvenationMana: " + rejuvenationMana);

    // 33% of total healing from WG during ToL and divide it with the encounter total healing.
    let wildGrowthIncreasedEffect = (this.totalHealingFromWildgrowthsDuringToL/HEALING_INCREASE - this.totalHealingFromWildgrowthsDuringToL/(HEALING_INCREASE * WILD_GROWTH_HEALING_INCREASE)) / this.totalHealingEncounter;
    debug && console.log("wildGrowthIncreasedEffect: " + wildGrowthIncreasedEffect);

    // Total throughput from using Tree of Life
    this.throughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;
    debug && console.log("throughput: " + this.throughput);
  }
}

export default TreeOfLife;
