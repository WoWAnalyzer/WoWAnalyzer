import Module from 'Main/Parser/Module';
import { TRANQUILITY_HEAL_SPELL_ID, SWIFTMEND_HEAL_SPELL_ID, HEALING_TOUCH_HEAL_SPELL_ID, REGROWTH_HEAL_SPELL_ID,
    CENARION_WARD_TALENT_SPELL_ID, EFFLORESCENCE_CAST_SPELL_ID, LIFEBLOOM_HOT_HEAL_SPELL_ID, INNERVATE_CAST_ID,
    INFUSION_OF_NATURE_TRAIT_SPELL_ID, REJUVENATION_HEAL_SPELL_ID, CLEARCASTING_SPELL_ID, WILD_GROWTH_HEAL_SPELL_ID}
    from 'Main/Parser/Constants';

const BASE_MANA = 220000;
const WILD_GROWTH_BASE_MANA = 0.34;
const EFFLORESCENCE_BASE_MANA = 0.216;
const CENARION_WARD_BASE_MANA = 0.092;
const REJUVENATION_BASE_MANA = 0.1;
const LIFEBLOOM_BASE_MANA = 0.12;
const HEALING_TOUCH_BASE_MANA = 0.9;
const SWIFTMEND_BASE_MANA = 0.14;
const TRANQUILITY_BASE_MANA = 0.184;
const REGROWTH_BASE_MANA = 0.1863;
const INFUSION_OF_NATURE_REDUCTION = 0.02;
const TOL_REJUVENATION_REDUCTION = 0.3;

const debug = false;

class Innervate extends Module {
  manaSaved = 0;
  wildGrowths = 0;
  efflorescences = 0;
  cenarionWards = 0;
  rejuvenations = 0;
  regrowths = 0;
  lifeblooms = 0;
  healingTouches = 0;
  swiftmends = 0;
  tranquilities = 0;
  freeRegrowths = 0;
  infusionOfNatureTraits = 0;
  innervateApplyTimestamp = null;
  castsUnderInnervate = 0;
  innervateCount = 0;
  secondsManaCapped = 0;
  lastInnervateTimestamp = 0;
  depleted = false;
  on_initialized() {
   if (!this.owner.error) {
     this.infusionOfNatureTraits = this.owner.selectedCombatant.traitsBySpellId[INFUSION_OF_NATURE_TRAIT_SPELL_ID] || 0;
   }
 }

 on_toPlayer_applybuff(event) {
   const spellId = event.ability.guid;
   if (INNERVATE_CAST_ID === spellId) {
     this.innervateCount++;
     this.lastInnervateTimestamp = event.timestamp;
   }
 }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (INNERVATE_CAST_ID === spellId) {
      this.depleted = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.owner.selectedCombatant.hasBuff(INNERVATE_CAST_ID)) {
      // Checking if the player is mana capped during an innervate.
      // This is not 100% accuarate because we trigger the calculation on the first heal during an innervate.
      // Realistically the seconds mana capped is higher.
      if(event.classResources[0].amount === event.classResources[0].max && !this.depleted) {
        this.secondsManaCapped = Math.abs(((this.lastInnervateTimestamp + 10000) - event.timestamp))/1000;
        this.depleted = true;
      }
      if (REJUVENATION_HEAL_SPELL_ID === spellId) {
        this.addToManaSaved(REJUVENATION_BASE_MANA);
        this.castsUnderInnervate++;
        this.rejuvenations++;
      }
      if (WILD_GROWTH_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(WILD_GROWTH_BASE_MANA);
          this.castsUnderInnervate++;
          this.wildGrowths++;
      }
      if (EFFLORESCENCE_CAST_SPELL_ID === spellId) {
          this.addToManaSaved(EFFLORESCENCE_BASE_MANA);
          this.castsUnderInnervate++;
          this.efflorescences++;
      }
      if (CENARION_WARD_TALENT_SPELL_ID === spellId) {
          this.addToManaSaved(CENARION_WARD_BASE_MANA);
          this.castsUnderInnervate++;
          this.cenarionWards++;
      }
      if (REGROWTH_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(REGROWTH_BASE_MANA);
          this.castsUnderInnervate++;
          this.regrowths++;
      }
      if (LIFEBLOOM_HOT_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(LIFEBLOOM_BASE_MANA);
          this.castsUnderInnervate++;
          this.lifeblooms++;
      }
      if (HEALING_TOUCH_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(HEALING_TOUCH_BASE_MANA);
          this.castsUnderInnervate++;
          this.healingTouches++;
      }
      if (SWIFTMEND_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(SWIFTMEND_BASE_MANA);
          this.castsUnderInnervate++;
          this.swiftmends++;
      }
      if (TRANQUILITY_HEAL_SPELL_ID === spellId) {
          this.addToManaSaved(TRANQUILITY_BASE_MANA);
          this.castsUnderInnervate++;
          this.tranquilities++;
      }
    }
  }

  addToManaSaved(spellBaseMana) {
    if(spellBaseMana === WILD_GROWTH_BASE_MANA) {
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1 - (this.infusionOfNatureTraits*INFUSION_OF_NATURE_REDUCTION)));
    } else if(this.owner.selectedCombatant.hasBuff(this.TREE_OF_LIFE_CAST_ID) && spellBaseMana === REJUVENATION_BASE_MANA){
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1-TOL_REJUVENATION_REDUCTION));
    } else if (this.owner.selectedCombatant.hasBuff(CLEARCASTING_SPELL_ID) && spellBaseMana === REGROWTH_BASE_MANA){
      this.freeRegrowths++;
    }else {
      this.manaSaved += (BASE_MANA * spellBaseMana);
    }
  }

  on_finished() {
    if(debug) {
      console.log("Innervates gained: " + this.innervateCount);
      console.log("Mana saved: " + this.manaSaved);
      console.log("Avg. Mana saved: " + (this.manaSaved/this.innervateCount));
      console.log("Total Casts under innervate: " + this.castsUnderInnervate);
      console.log("Avg Casts under innervate: " + (this.castsUnderInnervate/this.innervateCount));
      console.log("Free regrowths cast: " + this.freeRegrowths);
      console.log("WGs: " + this.wildGrowths);
      console.log("Efflos: " + this.efflorescences);
      console.log("CWs: " + this.cenarionWards);
      console.log("Rejvus: " + this.rejuvenations);
      console.log("Regrowth: " + this.regrowths);
      console.log("LBs: " + this.lifeblooms);
      console.log("HT: " + this.healingTouches);
      console.log("SM: " + this.swiftmends);
      console.log("Tranq: " + this.tranquilities);
      console.log("Amount of seconds mana capped: " + this.secondsManaCapped);
    }
  }
}

export default Innervate;
