import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class ChiJi extends Module {
  priorty = 9;
  petID = null;
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
  }

  on_byPlayer_summon(event) {
    if(event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) {
      this.petID = event.targetID;
      debug && console.log('Chi-Ji Summoned: ' + this.petID);
    }
  }

  on_heal (event) {
    if(event.sourceID === this.petID && event.ability.guid === SPELLS.CRANE_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    this.owner.totalHealing += this.healing;
    if(debug) {
      console.log('Chi-Ji ID: ' + this.petID);
      console.log('Chi-Ji Healing: ' + this.healing);
    }
  }
}

export default ChiJi;


// 198664 - Chi-Ji Summon
