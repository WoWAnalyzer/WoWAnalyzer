import Combatant, { FullCombatant } from 'parser/core/Combatant';
import { AnyEvent, HasSource, HasTarget } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import Entities from './Entities';

class Combatants extends Entities<Combatant> {
  players: Record<number, Combatant> = {};
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

  _selected!: FullCombatant;
  get selected(): FullCombatant {
    return this._selected;
  }

  constructor(options: Options) {
    super(options);
    if (this.owner.playerCombatantInfo) {
      this._selected = this.players[this.owner.playerId] = new FullCombatant(
        this.owner,
        this.owner.playerDetails.find((player) => player.id === this.owner.playerId)!,
        this.owner.playerCombatantInfo,
      );
    } else {
      throw new Error('no combatantinfo found for selected combatant');
    }
    this.owner.playerDetails.forEach((player) => {
      if (!this.players[player.id]) {
        this.players[player.id] = new Combatant(this.owner, player);
      }
    });
  }
}

export default Combatants;
