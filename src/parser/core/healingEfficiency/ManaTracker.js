import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class ManaTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 50000; //TODO check for chest enchant that increases max mana by 6%
  }
}

export default ManaTracker;
