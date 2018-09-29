import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/core/modules/ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.COMBO_POINTS;
  }
}

export default ComboPointTracker;
