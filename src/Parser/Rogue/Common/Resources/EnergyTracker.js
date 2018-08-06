import RESOURCE_TYPES from 'Game/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.ENERGY;
  }
}

export default EnergyTracker;
