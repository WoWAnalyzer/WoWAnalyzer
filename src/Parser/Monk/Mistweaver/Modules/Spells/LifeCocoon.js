import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;
const LC_HEALING_INCREASE = 0.5;

const AFFECTED_SPELLS = [
  SPELLS.RENEWING_MIST_HEAL.id,
  SPELLS.ENVELOPING_MIST.id,
];

class LifeCocoon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_byPlayer_heal(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (!AFFECTED_SPELLS.includes(spellId)) {
      debug && console.log('Exiting');
      return;
    }

    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.LIFE_COCOON.id, event.timestamp, 0, 0) === true) {
        this.healing += calculateEffectiveHealing(event, LC_HEALING_INCREASE);
        debug && console.log('Event Details for Healing Increase: ' + event.ability.name);
      }
    }
  }
}

export default LifeCocoon;
