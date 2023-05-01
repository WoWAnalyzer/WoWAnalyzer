import {
  BARBED_SHOT_FOCUS_REGEN_BUFFS_IDS,
  BARBED_SHOT_REGEN,
} from 'analysis/retail/hunter/beastmastery/constants';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  RESOURCES_HUNTER_MINOR_THRESHOLD,
  RESOURCES_HUNTER_AVERAGE_THRESHOLD,
  RESOURCES_HUNTER_MAJOR_THRESHOLD,
} from './constants';

class FocusTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FOCUS;
  }

  get percentAtCapPerformance(): QualitativePerformance {
    const percentAtCap = this.percentAtCap;
    if (percentAtCap <= RESOURCES_HUNTER_MINOR_THRESHOLD) {
      return QualitativePerformance.Perfect;
    }
    if (percentAtCap <= RESOURCES_HUNTER_AVERAGE_THRESHOLD) {
      return QualitativePerformance.Good;
    }
    if (percentAtCap <= RESOURCES_HUNTER_MAJOR_THRESHOLD) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  //Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.
  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste = 0;
    let gain;
    gain = event.resourceChange;
    if (BARBED_SHOT_FOCUS_REGEN_BUFFS_IDS.includes(spellId)) {
      waste = BARBED_SHOT_REGEN - gain;
      gain = gain - waste;
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, gain, waste, event.timestamp, this.getResource(event));
  }

  //We're not interested in the fabricated events that are created prepull, as these tend to add focus costs things such as potion usage, Bestial Wrath, Trueshot or the likes whereas these don't cost focus.
  shouldProcessCastEvent(event: CastEvent) {
    return !event.__fabricated && Boolean(this.getResource(event));
  }
}

export default FocusTracker;
