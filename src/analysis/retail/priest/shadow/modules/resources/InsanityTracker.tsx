import { VOID_TORRENT_INSANITY_PER_TICK } from 'analysis/retail/priest/shadow/constants';
import TALENTS from 'common/TALENTS/priest';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { ResourceChangeEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class InsanityTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.INSANITY;
  }

  get WastedInsanityPerformance(): QualitativePerformance {
    const wasted = this.wasted;
    if (wasted <= 50) {
      return QualitativePerformance.Perfect;
    }
    if (wasted <= 100) {
      return QualitativePerformance.Good;
    }
    if (wasted <= 150) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  // Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.

  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste = 0;
    let gain = 0;
    //void torrent does not show waste
    //This gets waste for resource changes that give you less than the full amount due to overcapping.
    //If you are at max insanity, no event occurs and that overcapping isn't calculated.
    if (spellId === TALENTS.VOID_TORRENT_TALENT.id) {
      gain = event.resourceChange;
      waste = VOID_TORRENT_INSANITY_PER_TICK - gain;
      gain = gain - waste;
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, gain, waste, event.timestamp, this.getResource(event));
  }
}
export default InsanityTracker;
