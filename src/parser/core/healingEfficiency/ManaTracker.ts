import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Analyzer';

class ManaTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 10000; //Prepatch value
  }

  maxResource: number;
}

export default ManaTracker;
