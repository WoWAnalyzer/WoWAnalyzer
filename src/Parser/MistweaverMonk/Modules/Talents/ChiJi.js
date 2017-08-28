import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import HealingDone from 'Parser/Core/Modules/HealingDone';

const debug = false;

class ChiJi extends Module {
  static dependencies = {
    healingDone: HealingDone,
  };

  petID = null;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
  }

  on_byPlayer_summon(event) {
    if (event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) {
      this.petID = event.targetID;
      debug && console.log('Chi-Ji Summoned: ' + this.petID);
    }
  }

  on_heal(event) {
    if (event.sourceID === this.petID && event.ability.guid === SPELLS.CRANE_HEAL.id) {
      this.healingDone._total = this.healingDone._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
    }
  }

  on_finished() {
    if (debug) {
      console.log('Chi-Ji ID: ' + this.petID);
    }
  }
}

export default ChiJi;

// 198664 - Chi-Ji Summon
