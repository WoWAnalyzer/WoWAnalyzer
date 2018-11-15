import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

class SoothingMistTracker extends ResourceTracker {

  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
  }
}

export default SoothingMistTracker;
