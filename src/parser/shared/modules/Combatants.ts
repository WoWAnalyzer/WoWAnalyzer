import Combatant from 'parser/core/Combatant';
import { AnyEvent, HasTarget } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import Entities from './Entities';

class Combatants extends Entities<Combatant> {
  players: { [playerId: number]: Combatant } = {};
  get playerCount() {
    return Object.keys(this.players).length;
  }
  getEntities() {
    return this.players;
  }
  getEntity(event: AnyEvent) {
    if (!HasTarget(event)) {
      return null;
    }
    const combatant = this.players[event.targetID];
    if (!combatant) {
      return null; // a pet or something probably, either way we don't care.
    }
    return combatant;
  }

  _selected: Combatant;
  /** @returns Combatant */
  get selected() {
    return this._selected;
  }

  constructor(options: Options) {
    super(options);
    this.generateCombatants();
    this._selected = this.players[this.owner.playerId];
  }

  generateCombatants() {
    this.owner.combatantInfoEvents.forEach((combatantInfo) => {
      if (combatantInfo.error) {
        console.error(
          `Error retrieving combatant information for player with sourceID ${combatantInfo.sourceID}`,
        );
        return;
      }

      this.players[combatantInfo.sourceID] = new Combatant(this.owner, combatantInfo);
    });
  }
}

export default Combatants;
