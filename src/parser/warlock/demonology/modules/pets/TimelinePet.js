const DEMONIC_TYRANT_EXTENSION = 15000;

class TimelinePet {
  name = 'unknown';
  guid = null;
  id = null;
  instance = null;
  spawn = null;
  expectedDespawn = null;
  summonedBy = null;
  realDespawn = null;

  // Wild Imp properties
  x = null; // position due to Implosion
  y = null;
  shouldImplode = false;
  currentEnergy; // energy because they can despawn "prematurely" due to their mechanics

  constructor(petInfo, id, instance, timestamp, duration, summonedBy) {
    this.name = petInfo.name;
    this.guid = petInfo.guid;
    this.id = id;
    this.instance = instance;
    this.spawn = timestamp;
    this.expectedDespawn = timestamp + duration;
    this.summonedBy = summonedBy;
  }

  setWildImpProperties(playerPosition) {
    this.x = playerPosition.x;
    this.y = playerPosition.y;
    this.shouldImplode = false;
    this.currentEnergy = 100;
  }

  updatePosition(event) {
    this.x = event.x;
    this.y = event.y;
  }

  despawn(timestamp) {
    this.realDespawn = timestamp;
  }

  extend() {
    this.expectedDespawn += DEMONIC_TYRANT_EXTENSION;
  }
}
export default TimelinePet;
