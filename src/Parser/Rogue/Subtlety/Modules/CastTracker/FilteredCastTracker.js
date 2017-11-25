
import CastTracker from './CastTracker';

class FilteredCastTracker extends CastTracker {
    trackedCasts =  {};
    
  shouldProcessCastEvent(event) {
    return event.ability.guid in this.trackedCasts;
  }

}

export default FilteredCastTracker;