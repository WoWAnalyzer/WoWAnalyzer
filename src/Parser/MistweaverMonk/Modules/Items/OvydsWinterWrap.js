import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const debug = true;
const OVYDS_HEALING_INCREASE = .4;

class OvydsWinterWrap extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasWaist(ITEMS.OVYDS_WINTER_WRAP.id);
    }
  }

  on_byPlayer_heal(event) {
    const targetId = event.targetID;
    if(this.owner.combatants.players[targetId]) {
      if(this.owner.combatants.players[targetId].hasBuff(SPELLS.OVYDS_WINTER_WRAP_BUFF.id, event.timestamp, 0, 0) === true) {
        this.healing += calculateEffectiveHealing(event, OVYDS_HEALING_INCREASE);
      }
    }
  }

  on_finished() {
    if(debug) {
      console.log('Ovyd\'s Healing Contribution: ' + this.healing);
    }
  }
}

export default OvydsWinterWrap;
