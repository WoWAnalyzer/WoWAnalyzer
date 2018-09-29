import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/core/modules/ResourceTracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.ENERGY;
  }
}

export default EnergyTracker;
