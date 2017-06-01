import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';


const BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE = 3;
const T20P2_MAX_SWIFTMEND_REDUCTION = 0.4;
const debug = false;

class T20 extends Module {
  healing = 0;
  swiftmendReduced = 0;
  swiftmends = 0;
  swiftmendCooldown = 30;

  on_initialized() {
    if(this.owner.selectedCombatant.lv15Talent === SPELLS.PROSPERITY_TALENT.id) {
     this.swiftmendCooldown = 27;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EFFLORESCENCE_HEAL.id) {
      if(this.owner.selectedCombatant.hasBuff(SPELLS.BLOSSOMING_EFFLORESCENCE.id, event.timestamp, 0, 0)) {
        let baseHeal = (event.amount + event.overheal||0)/BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE;
        this.healing += Math.max(0, event.amount - baseHeal)/BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE;
      }
    } else if(spellId === SPELLS.SWIFTMEND.id) {
      let hpPercentage = (event.hitPoints - event.amount)/event.maxHitPoints;
      let cooldownReduction = (T20P2_MAX_SWIFTMEND_REDUCTION - (hpPercentage * T20P2_MAX_SWIFTMEND_REDUCTION));
      this.swiftmendReduced += this.swiftmendCooldown * cooldownReduction;
      this.swiftmends++;
    }
  }

  on_finished() {
    debug && console.log("4P Uptime: " + ((this.owner.selectedCombatant.getBuffUptime(SPELLS.BLOSSOMING_EFFLORESCENCE.id)/this.owner.fightDuration)*100).toFixed(2)+"%");
    debug && console.log("4P Healing %: " + ((this.healing/this.owner.totalHealing)*100).toFixed(2)+ "%");
    debug && console.log("4P Healing: " + this.healing);
    debug && console.log("Total Healing: " + this.owner.totalHealing);
    debug && console.log("Swiftmends cast: " + this.swiftmends);
    debug && console.log("2P swiftmend reduction: " + this.swiftmendReduced.toFixed(1)+"s");
    debug && console.log("Avg reduction per swiftmend: " + (this.swiftmendReduced/this.swiftmends).toFixed(1)+"s");
  }
}

export default T20;
