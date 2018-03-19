import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { BEACON_TYPES } from '../../Constants';

const BEACONS = Object.keys(BEACON_TYPES).map(key => BEACON_TYPES[key]);

const debug = false;

class BeaconTargets extends Analyzer {
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

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (!BEACONS.includes(spellId)) {
      return;
    }
    const targetId = event.targetID;
    if (!this.currentBeaconTargets.includes(targetId)) {
      this.currentBeaconTargets.push(targetId);
      debug && console.log(`%c${this.combatants.players[targetId].name} gained a beacon`, 'color:green', this.currentBeaconTargets);
      this.owner.fabricateEvent('beacon_changed', null, event);
    } else {
      debug && console.error(`Trying to assign a beacon to ${this.combatants.players[event.sourceID].name}, but he already has one.`, this.currentBeaconTargets);
    }
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (!BEACONS.includes(spellId)) {
      return;
    }
    const targetId = event.targetID;
    this.currentBeaconTargets = this.currentBeaconTargets.filter(id => id !== targetId);
    debug && console.log(`%c${this.combatants.players[targetId].name} lost a beacon`, 'color:red', this.currentBeaconTargets);
    this.owner.fabricateEvent('beacon_changed', null, event);
  }
}

export default BeaconTargets;
