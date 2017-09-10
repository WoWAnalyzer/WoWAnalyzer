import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;
const OVYDS_HEALING_INCREASE = .4;

const UNAFFECTED_SPELLS = [
  SPELLS.CRANE_HEAL.id,
  SPELLS.ZEN_PULSE_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_HEAL.id,
];

class OvydsWinterWrap extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.OVYDS_WINTER_WRAP.id);
  }

  on_byPlayer_heal(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (UNAFFECTED_SPELLS.indexOf(spellId) !== -1) {
      debug && console.log('Exiting');
      return;
    }

    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.OVYDS_WINTER_WRAP_BUFF.id, event.timestamp, 0, 0) === true) {
        this.healing += calculateEffectiveHealing(event, OVYDS_HEALING_INCREASE);
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log('Ovyd\'s Healing Contribution: ' + this.healing);
    }
  }

  item() {
    return {
      item: ITEMS.OVYDS_WINTER_WRAP,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default OvydsWinterWrap;
