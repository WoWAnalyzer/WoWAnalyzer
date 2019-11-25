import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.ENERGY;
    this.initBuilderAbility(SPELLS.TIGERS_FURY.id);
  }
}

export default EnergyTracker;
