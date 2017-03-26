import Module from 'Main/Parser/Module';

import Combatant from './Combatant';

class Combatants extends Module {
  players = {};
  selected = null;

  parse_combatantinfo(event) {
    console.log('combatantinfo', event);

    this.players[event.sourceID] = event;

    if (this.owner.byPlayer(event)) {
      this.selected = new Combatant(event);
    }
  }
}

export default Combatants;
