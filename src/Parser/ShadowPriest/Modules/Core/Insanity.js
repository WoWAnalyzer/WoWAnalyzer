import Module from 'Parser/Core/Module';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class Insanity extends Module {
  _insanityEvents = [];

  on_toPlayer_energize(event) {
    if (event.resourceChangeType === RESOURCE_TYPES.INSANITY) {
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
