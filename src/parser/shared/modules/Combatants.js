import Entities from './Entities';
import Combatant from '../../core/Combatant';

class Combatants extends Entities {
  players = {};
  get playerCount() {
    return Object.keys(this.players).length;
  }
  getEntities() {
    return this.players;
  }
  getEntity(event) {
    const targetId = event.targetID;
    const combatant = this.players[targetId];
    if (!combatant) {
      return null; // a pet or something probably, either way we don't care.
    }
    return combatant;
  }

  /** @returns Combatant */
  get selected() {
    return this.players[this.owner.playerId];
  }

  constructor(...args) {
    super(...args);
    this.owner.combatantInfoEvents.forEach(combatantInfo => {
      if (combatantInfo.error) {
        console.error(`Error retrieving combatant information for player with sourceID ${combatantInfo.sourceID}`);
        return;
      }

      this.players[combatantInfo.sourceID] = new Combatant(this.owner, combatantInfo);
    });
  }
}

export default Combatants;
