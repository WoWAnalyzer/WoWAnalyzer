import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';

import HealingDone from 'Parser/Core/Modules/HealingDone';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE = 2;
const T20P2_MAX_SWIFTMEND_REDUCTION = 0.4;
const debug = false;

class T20 extends Module {
  static dependencies = {
    healingDone: HealingDone,
  };

  healing = 0;
  swiftmendReduced = 0;
  swiftmends = 0;
  swiftmendCooldown = 30;
  freeSwiftmends = 0;
  swiftmendHealing = 0;

  on_initialized() {
    if (this.owner.modules.combatants.selected.lv15Talent === SPELLS.PROSPERITY_TALENT.id) {
      this.swiftmendCooldown = 27;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EFFLORESCENCE_HEAL.id) {
      if (this.owner.modules.combatants.selected.hasBuff(SPELLS.BLOSSOMING_EFFLORESCENCE.id, event.timestamp, 0, 0)) {
        this.healing += calculateEffectiveHealing(event, BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE);
      }
    } else if (spellId === SPELLS.SWIFTMEND.id) {
      const hpPercentage = (event.hitPoints - event.amount)/event.maxHitPoints;
      const cooldownReduction = (T20P2_MAX_SWIFTMEND_REDUCTION - (hpPercentage * T20P2_MAX_SWIFTMEND_REDUCTION));
      this.swiftmendReduced += this.swiftmendCooldown * cooldownReduction;
      this.swiftmends += 1;
      this.freeSwiftmends = this.swiftmendReduced/this.swiftmendCooldown;
      this.swiftmendHealing += event.amount;
    }
    this.swiftmendThroughput = (this.healing/this.swiftmends)*this.freeSwiftmends + this.swiftmendHealing/this.swiftmends;
  }

  on_finished() {
    if (debug) {
      console.log("4P Uptime: " + ((this.owner.modules.combatants.selected.getBuffUptime(SPELLS.BLOSSOMING_EFFLORESCENCE.id) / this.owner.fightDuration) * 100).toFixed(2) + "%");
      console.log("4P Healing %: " + (this.owner.getPercentageOfTotalHealingDone(this.healing) * 100).toFixed(2) + "%");
      console.log("4P Healing: " + this.healing);
      console.log("Total Healing: " + this.healingDone.total.effective);
      console.log("Swiftmends cast: " + this.swiftmends);
      console.log("2P swiftmend reduction: " + this.swiftmendReduced.toFixed(1) + "s");
      console.log("Avg reduction per swiftmend: " + (this.swiftmendReduced / this.swiftmends).toFixed(1) + "s");
    }
  }
}

export default T20;
