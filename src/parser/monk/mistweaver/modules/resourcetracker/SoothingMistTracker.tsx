import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class SoothingMistTracker extends ResourceTracker {
  constructor(args: Options) {
    super(args);
    this.resource = RESOURCE_TYPES.MANA;
  }
}

export default SoothingMistTracker;
