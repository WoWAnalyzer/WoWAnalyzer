import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { EnergizeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { SHADOW_SPELLS_WITHOUT_WASTE, VOID_TORRENT_INSANITY_PER_TICK } from 'parser/priest/shadow/constants';

class InsanityTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.INSANITY;
  }

  // Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.
  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste = 0;
    let gain = 0;
    if (SHADOW_SPELLS_WITHOUT_WASTE.includes(spellId)) {
      gain = event.resourceChange;
      if (spellId === SPELLS.VOID_TORRENT_TALENT.id) {
        waste = VOID_TORRENT_INSANITY_PER_TICK - gain;
        gain = gain - waste;
      }
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, gain, waste, this.getResource(event), event.timestamp);
  }
}
export default InsanityTracker;
