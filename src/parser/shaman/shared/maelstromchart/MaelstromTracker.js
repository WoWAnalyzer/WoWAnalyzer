import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class MaelstromTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MAELSTROM;
    this.maxResource = 100;
  }

}
export default MaelstromTracker;
