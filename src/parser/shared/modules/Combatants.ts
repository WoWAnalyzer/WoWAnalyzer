import Combatant from 'parser/core/Combatant';
import { AnyEvent, HasSource, HasTarget } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import SelectedCombatant, { validSelectedCombatant } from 'parser/core/SelectedCombatant';

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

  getSourceEntity(event: AnyEvent) {
    if (!HasSource(event)) {
      return null;
    }
    const combatant = this.players[event.sourceID];
    if (!combatant) {
      return null; // a pet or something probably, either way we don't care.
    }
    return combatant;
  }

  _selected: SelectedCombatant;
  get selected() {
    return this._selected;
  }

  constructor(options: Options) {
    super(options);
    this.owner.combatantInfoEvents.forEach((combatantInfo) => {
      if (combatantInfo.error) {
        console.error(
          `Error retrieving combatant information for player with sourceID ${combatantInfo.sourceID}`,
        );
        return;
      }

      if (!this.players[combatantInfo.sourceID]) {
        this.players[combatantInfo.sourceID] = new Combatant(this.owner, combatantInfo);
      }
    });
    const selected = this.players[this.owner.playerId];
    if (!validSelectedCombatant(selected)) {
      throw new Error('Invalid selected combatant');
    }
    this._selected = selected;
  }
}

export default Combatants;
