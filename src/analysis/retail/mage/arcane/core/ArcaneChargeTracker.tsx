import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const MAX_ARCANE_CHARGES = 4;

class ArcaneChargeTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ARCANE_CHARGES;
    this.maxResource = MAX_ARCANE_CHARGES;
  }

  clearCharges(event: CastEvent) {
    this._applySpender(event, this.current);
  }
}

export default ArcaneChargeTracker;
