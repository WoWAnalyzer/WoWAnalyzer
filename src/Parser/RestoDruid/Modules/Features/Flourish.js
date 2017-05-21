import Module from 'Parser/Core/Module';
import {
  FLOURISH_CAST_ID,
  REJUVENATION_HEAL_SPELL_ID,
  REGROWTH_HEAL_SPELL_ID,
  WILD_GROWTH_HEAL_SPELL_ID,
  REJUVENATION_GERMINATION_HEAL_SPELL_ID,
  CULTIVATION_HEAL_SPELL_ID,
  CENARION_WARD_HEAL_SPELL_ID,
  LIFEBLOOM_HOT_HEAL_SPELL_ID,
  SPRING_BLOSSMOS_HEAL_SPELL_ID
} from '../../Constants';

const debug = false;

class Flourish extends Module {
  flourishCounter = 0;
  wildGrowth = 0;
  rejuvenation = 0;
  regrowth = 0;
  cultivation = 0;
  cenarionWard = 0;
  lifebloom = 0;
  springBlossoms = 0;

  hasGermination = false;
  hasSpringBlossoms = false;
  hasCenarionWard = false;
  hasCultivation = false;
  hasTreeOfLife = false;

  on_initialized() {
    //Germination TODO: Refactor id
    this.hasGermination = this.owner.selectedCombatant.lv90Talent === 155675;
    this.hasSpringBlossoms = this.owner.selectedCombatant.lv90Talent === 207385;
    this.hasCenarionWard = this.owner.selectedCombatant.lv15Talent === 102351;
    this.hasCultivation = this.owner.selectedCombatant.lv75Talent === 200390;
    this.hasTreeOfLife = this.owner.selectedCombatant.lv75Talent === 33891;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (FLOURISH_CAST_ID !== spellId) {
      return;
    }
    debug && console.log("Flourish cast #: " + this.flourishCounter);
    this.flourishCounter++;

    // Wild growth
    let oldWgCount = this.wildGrowth;
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(player.hasBuff(WILD_GROWTH_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
          this.wildGrowth++;
        }
    });
    // If we are using Tree Of Life, our WG statistics will be a little skewed since each WG gives 8 WG applications instead of 6.
    // We solve this by simply reducing WGs counter by 2.
    if(this.wildGrowth > (oldWgCount+6)) {
      this.wildGrowth = this.wildGrowth-2;
    }

    // Rejuvenation
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(player.hasBuff(REJUVENATION_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
          this.rejuvenation++;
        }
        if(this.hasGermination) {
          if(player.hasBuff(REJUVENATION_GERMINATION_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
            this.rejuvenation++;
          }
        }
    });

    //Regrowth
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(player.hasBuff(REGROWTH_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
          this.regrowth++;
        }
    });

    // Cultivation
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(this.hasCultivation) {
          if(player.hasBuff(CULTIVATION_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
            this.cultivation++;
          }
        }
    });

    // Cenarion Ward
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(this.hasCenarionWard) {
          if(player.hasBuff(CENARION_WARD_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
            debug && console.log("object %o",player);
            this.cenarionWard++;
          }
        }
    });

    // Lifebloom
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(player.hasBuff(LIFEBLOOM_HOT_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
            this.lifebloom++;
        }
    });

    // Spring blossoms
    Object.keys(this.owner.combatants.players)
      .map(player => this.owner.combatants.players[player])
      .forEach((player) => {
        if(this.hasSpringBlossoms) {
          if(player.hasBuff(SPRING_BLOSSMOS_HEAL_SPELL_ID, event.timestamp, 0, 0) === true) {
              this.springBlossoms++;
          }
        }
    });
  }
}

export default Flourish;
