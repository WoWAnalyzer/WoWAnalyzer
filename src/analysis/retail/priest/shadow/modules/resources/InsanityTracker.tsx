import {
  SHADOW_SPELLS_WITHOUT_WASTE,
  VOID_TORRENT_INSANITY_PER_TICK,
} from 'analysis/retail/priest/shadow/constants';
import TALENTS from 'common/TALENTS/priest';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class InsanityTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.INSANITY;
  }

  // Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.
  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste = 0;
    let gain = 0;
    if (SHADOW_SPELLS_WITHOUT_WASTE.includes(spellId)) {
      gain = event.resourceChange;
      if (spellId === TALENTS.VOID_TORRENT_TALENT.id) {
        waste = VOID_TORRENT_INSANITY_PER_TICK - gain;
        gain = gain - waste;
      }
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, gain, waste, event.timestamp, this.getResource(event));
  }
}
export default InsanityTracker;
