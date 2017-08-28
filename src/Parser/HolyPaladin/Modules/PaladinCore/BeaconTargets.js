import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import { BEACON_TYPES } from '../../Constants';

const BEACONS = Object.keys(BEACON_TYPES).map(key => BEACON_TYPES[key]);

const debug = false;

class BeaconTargets extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  
  currentBeaconTargets = [];

  hasBeacon(playerId) {
    return this.currentBeaconTargets.indexOf(playerId) !== -1;
  }
  get numBeaconsActive() {
    return this.currentBeaconTargets.length;
  }

  on_combatantinfo(event) {
    const playerId = this.owner.playerId;
    if (event.sourceID === playerId) return;
    event.auras.forEach((aura) => {
      const { source, ability } = aura;
      if (source === playerId && BEACONS.indexOf(ability) !== -1) {
        this.currentBeaconTargets.push(event.sourceID);
        debug && console.log(`%c${this.combatants.players[event.sourceID].name} has a beacon`, 'color:green', this.currentBeaconTargets);
        this.owner.triggerEvent('beacon_changed', event);
      }
    });
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (BEACONS.indexOf(spellId) === -1) {
      return;
    }
    const targetId = event.targetID;
    this.currentBeaconTargets.push(targetId);
    debug && console.log(`%c${this.combatants.players[targetId].name} gained a beacon`, 'color:green', this.currentBeaconTargets);
    this.owner.triggerEvent('beacon_changed', event);
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (BEACONS.indexOf(spellId) === -1) {
      return;
    }
    const targetId = event.targetID;
    this.currentBeaconTargets = this.currentBeaconTargets.filter(id => id !== targetId);
    debug && console.log(`%c${this.combatants.players[targetId].name} lost a beacon`, 'color:red', this.currentBeaconTargets);
    this.owner.triggerEvent('beacon_changed', event);
  }
}

export default BeaconTargets;
