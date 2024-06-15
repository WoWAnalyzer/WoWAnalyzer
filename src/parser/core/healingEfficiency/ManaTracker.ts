import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class ManaTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 2500000;
  }

  maxResource: number;
}

export default ManaTracker;
