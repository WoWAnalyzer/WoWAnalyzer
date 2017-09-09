import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

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
    this.infusionOfNatureTraits = this.owner.modules.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_NATURE_TRAIT.id] || 0;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INNERVATE.id === spellId) {
      this.innervateCount += 1;
      this.lastInnervateTimestamp = event.timestamp;
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INNERVATE.id === spellId) {
      this.depleted = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.owner.modules.combatants.selected.hasBuff(SPELLS.INNERVATE.id)) {
      // Checking if the player is mana capped during an innervate.
      // This is not 100% accuarate because we trigger the calculation on the first heal during an innervate.
      // Realistically the seconds mana capped is higher.
      if(event.classResources[0].amount === event.classResources[0].max && !this.depleted) {
        this.secondsManaCapped = Math.abs(((this.lastInnervateTimestamp + 10000) - event.timestamp))/1000;
        this.depleted = true;
      }
      if (SPELLS.REJUVENATION.id === spellId) {
        this.addToManaSaved(REJUVENATION_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.rejuvenations += 1;
      }
      if (SPELLS.WILD_GROWTH.id === spellId) {
        this.addToManaSaved(WILD_GROWTH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.wildGrowths += 1;
      }
      if (SPELLS.EFFLORESCENCE_CAST.id === spellId) {
        this.addToManaSaved(EFFLORESCENCE_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.efflorescences += 1;
      }
      if (SPELLS.CENARION_WARD === spellId) {
        this.addToManaSaved(CENARION_WARD_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.cenarionWards += 1;
      }
      if (SPELLS.REGROWTH.id === spellId) {
        this.addToManaSaved(REGROWTH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.regrowths += 1;
      }
      if (SPELLS.LIFEBLOOM_HOT_HEAL.id === spellId) {
        this.addToManaSaved(LIFEBLOOM_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.lifeblooms += 1;
      }
      if (SPELLS.HEALING_TOUCH.id === spellId) {
        this.addToManaSaved(HEALING_TOUCH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.healingTouches += 1;
      }
      if (SPELLS.SWIFTMEND.id === spellId) {
        this.addToManaSaved(SWIFTMEND_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.swiftmends += 1;
      }
      if (SPELLS.TRANQUILITY_HEAL.id === spellId) {
        this.addToManaSaved(TRANQUILITY_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.tranquilities += 1;
      }
    }
  }

  addToManaSaved(spellBaseMana) {
    if(spellBaseMana === WILD_GROWTH_BASE_MANA) {
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1 - (this.infusionOfNatureTraits*INFUSION_OF_NATURE_REDUCTION)));
    } else if(this.owner.modules.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && spellBaseMana === REJUVENATION_BASE_MANA){
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1-TOL_REJUVENATION_REDUCTION));
    } else if (this.owner.modules.combatants.selected.hasBuff(SPELLS.CLEARCASTING_BUFF.id) && spellBaseMana === REGROWTH_BASE_MANA){
      this.freeRegrowths += 1;
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
