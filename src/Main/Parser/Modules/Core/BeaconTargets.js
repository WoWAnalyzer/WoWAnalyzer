import Module from 'Main/Parser/Module';
import { BEACON_TRANSFER_SPELL_ID, BEACON_TRANSFERING_ABILITIES, BEACON_TYPES } from 'Main/Parser/Constants';

const BEACON_OF_LIGHT_BUFF_ID = 53563;
const BEACON_OF_FAITH_BUFF_ID = 156910;
const BEACON_OF_VIRTUE_BUFF_ID = 200025;
const BEACONS = [
  BEACON_OF_LIGHT_BUFF_ID,
  BEACON_OF_FAITH_BUFF_ID,
  BEACON_OF_VIRTUE_BUFF_ID,
];

const debug = true;

class BeaconTargets extends Module {
  currentBeaconTargets = [];

  on_combatantinfo(event) {
    const playerId = this.owner.playerId;
    if (event.sourceID === playerId) return;
    event.auras.forEach((aura) => {
      const { source, ability } = aura;
      if (source === playerId && BEACONS.indexOf(ability) !== -1) {
        this.currentBeaconTargets.push(event.sourceID);
        debug && console.log(`%c${this.owner.combatants.players[event.sourceID].name} has a beacon`, 'color:green', this.currentBeaconTargets)
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
    debug && console.log(`%c${this.owner.combatants.players[targetId].name} gained a beacon`, 'color:green', this.currentBeaconTargets)
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (BEACONS.indexOf(spellId) === -1) {
      return;
    }
    const targetId = event.targetID;
    this.currentBeaconTargets = this.currentBeaconTargets.filter(id => id !== targetId);
    debug && console.log(`%c${this.owner.combatants.players[targetId].name} lost a beacon`, 'color:red', this.currentBeaconTargets)
  }
}

export default BeaconTargets;
