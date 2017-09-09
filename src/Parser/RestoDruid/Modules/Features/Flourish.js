import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class Flourish extends Module {
  static dependencies = {
    combatants: Combatants,
  };

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
    this.hasGermination = this.owner.modules.combatants.selected.lv90Talent === SPELLS.GERMINATION_TALENT.id;
    this.hasSpringBlossoms = this.owner.modules.combatants.selected.lv90Talent === SPELLS.SPRING_BLOSSOMS_TALENT.id;
    this.hasCenarionWard = this.owner.modules.combatants.selected.lv15Talent === SPELLS.CENARION_WARD_TALENT.id;
    this.hasCultivation = this.owner.modules.combatants.selected.lv75Talent === SPELLS.CULTIVATION_TALENT.id;
    this.hasTreeOfLife = this.owner.modules.combatants.selected.lv75Talent === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.FLOURISH.id !== spellId) {
      return;
    }
    debug && console.log("Flourish cast #: " + this.flourishCounter);
    this.flourishCounter += 1;

    // Wild growth
    const oldWgCount = this.wildGrowth;
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.WILD_GROWTH.id, event.timestamp, 0, 0) === true) {
          this.wildGrowth += 1;
        }
      });
    // If we are using Tree Of Life, our WG statistics will be a little skewed since each WG gives 8 WG applications instead of 6.
    // We solve this by simply reducing WGs counter by 2.
    if (this.wildGrowth > (oldWgCount+6)) {
      this.wildGrowth = this.wildGrowth-2;
    }

    // Rejuvenation
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.REJUVENATION.id, event.timestamp, 0, 0) === true) {
          this.rejuvenation += 1;
        }
        if (this.hasGermination) {
          if (player.hasBuff(SPELLS.REJUVENATION_GERMINATION.id, event.timestamp, 0, 0) === true) {
            this.rejuvenation += 1;
          }
        }
      });

    //Regrowth
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.REGROWTH.id, event.timestamp, 0, 0) === true) {
          this.regrowth += 1;
        }
      });

    // Cultivation
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasCultivation) {
          if (player.hasBuff(SPELLS.CULTIVATION.id, event.timestamp, 0, 0) === true) {
            this.cultivation += 1;
          }
        }
      });

    // Cenarion Ward
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasCenarionWard) {
          if (player.hasBuff(SPELLS.CENARION_WARD.id, event.timestamp, 0, 0) === true) {
            this.cenarionWard += 1;
          }
        }
      });

    // Lifebloom
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, event.timestamp, 0, 0) === true) {
          this.lifebloom += 1;
        }
      });

    // Spring blossoms
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasSpringBlossoms) {
          if (player.hasBuff(SPELLS.SPRING_BLOSSOMS.id, event.timestamp, 0, 0) === true) {
            this.springBlossoms += 1;
          }
        }
      });
  }
}

export default Flourish;
