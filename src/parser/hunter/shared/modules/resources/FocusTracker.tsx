import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import { CastEvent, EnergizeEvent } from 'parser/core/Events';
import { CHIM_REGEN } from 'parser/hunter/shared/constants';
import { AOTW_REGEN, BARBED_SHOT_FOCUS_REGEN_BUFFS, BARBED_SHOT_REGEN, BEAST_MASTERY_SPELLS_WITHOUT_WASTE } from 'parser/hunter/beastmastery/constants';
import { Options } from 'parser/core/Analyzer';

class FocusTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FOCUS;
  }

  //Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.
  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste;
    let gain;
    if (BEAST_MASTERY_SPELLS_WITHOUT_WASTE.includes(spellId)) {
      gain = event.resourceChange;
      if (BARBED_SHOT_FOCUS_REGEN_BUFFS.includes(spellId)) {
        waste = BARBED_SHOT_REGEN - event.resourceChange;
      } else if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
        waste = AOTW_REGEN - event.resourceChange;
      } else if (spellId === SPELLS.CHIMAERA_SHOT_FOCUS.id) {
        waste = CHIM_REGEN - event.resourceChange;
      }
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, this.getResource(event), gain, waste, event.timestamp);
  }

  //We're not interested in the fabricated events that are created prepull, as these tend to add focus costs things such as potion usage, Bestial Wrath, Trueshot or the likes whereas these don't cost focus.
  shouldProcessCastEvent(event: CastEvent) {
    return !event.__fabricated && Boolean(this.getResource(event));
  }
}

export default FocusTracker;
