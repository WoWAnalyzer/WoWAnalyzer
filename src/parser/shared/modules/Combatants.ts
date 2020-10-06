import { Event, HasTarget, HealEvent } from 'parser/core/Events';
import Entities from './Entities';
import Combatant from '../../core/Combatant';

class Combatants extends Entities {
  players: Array<Combatant> = [];
  get playerCount() {
    return Object.keys(this.players).length;
  }
  getEntities() {
    return this.players;
  }
  getEntity(event: HealEvent) {
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

  constructor(options: any) {
    super(options);
    this.owner.combatantInfoEvents.forEach(combatantInfo => {
      if (combatantInfo.error) {
        console.error(`Error retrieving combatant information for player with sourceID ${combatantInfo.sourceID}`);
        return;
      }

      this.players[combatantInfo.sourceID] = new Combatant(this.owner, combatantInfo);
    });
    this._selected = this.players[this.owner.playerId];
  }
}

export default Combatants;
