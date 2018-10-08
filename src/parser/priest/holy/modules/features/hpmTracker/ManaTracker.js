import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

class ManaTracker extends ResourceTracker {

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }
}

export default ManaTracker;
