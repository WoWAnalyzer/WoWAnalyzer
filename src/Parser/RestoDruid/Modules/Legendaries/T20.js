import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS';

const BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE = 2;
const T20P2_MAX_SWIFTMEND_REDUCTION = 0.4;
const debug = false;

class T20 extends Module {
  healing = 0;
  swiftmendReduced = 0;
  swiftmends = 0;
  swiftmendCooldown = 30;
  freeSwiftmends = 0;
  swiftmendHealing = 0;

  on_initialized() {
    if(this.owner.selectedCombatant.lv15Talent === SPELLS.PROSPERITY_TALENT.id) {
     this.swiftmendCooldown = 27;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EFFLORESCENCE_HEAL.id) {
      if(this.owner.selectedCombatant.hasBuff(SPELLS.BLOSSOMING_EFFLORESCENCE.id, event.timestamp, 0, 0)) {
        this.healing += calculateEffectiveHealing(event, BLOSSOMING_EFFLORESCENCE_HEAL_INCREASE);
      }
    } else if(spellId === SPELLS.SWIFTMEND.id) {
      const hpPercentage = (event.hitPoints - event.amount)/event.maxHitPoints;
      const cooldownReduction = (T20P2_MAX_SWIFTMEND_REDUCTION - (hpPercentage * T20P2_MAX_SWIFTMEND_REDUCTION));
      this.swiftmendReduced += this.swiftmendCooldown * cooldownReduction;
      this.swiftmends++;
      this.freeSwiftmends = this.swiftmendReduced/this.swiftmendCooldown;
      this.swiftmendHealing += event.amount;
    }
    this.swiftmendThroughput = (this.healing/this.swiftmends)*this.freeSwiftmends + this.swiftmendHealing/this.swiftmends;
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
