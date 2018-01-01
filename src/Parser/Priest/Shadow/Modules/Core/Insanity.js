import Analyzer from 'Parser/Core/Analyzer';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class Insanity extends Analyzer {
  _insanityEvents = [];

  on_toPlayer_energize(event) {
    if (event.resourceChangeType === RESOURCE_TYPES.INSANITY.id) {
      this._insanityEvents = [
        ...this._insanityEvents,
        event,
      ];
    }
  }

  get events() {
    return this._insanityEvents;
  }
}

export default Insanity;
