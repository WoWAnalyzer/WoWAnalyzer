import Module from 'Main/Parser/Module';

import Combatant from './Combatant';

class Combatants extends Module {
  players = {};
  /** @returns Combatant */
  get selected() {
    return this.players[this.owner.playerId];
  }

  on_combatantinfo(event) {
    this.players[event.sourceID] = new Combatant(this.owner, event);
  }
}

export default Combatants;
