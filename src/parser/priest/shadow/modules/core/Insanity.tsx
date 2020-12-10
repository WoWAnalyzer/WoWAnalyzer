import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Events, { EnergizeEvent } from 'parser/core/Events';

class Insanity extends Analyzer {
  _insanityEvents: EnergizeEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.onInsanityEnergize);
  }

  get events() {
    return this._insanityEvents;
  }

  onInsanityEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.INSANITY.id) {
      this._insanityEvents = [
        ...this._insanityEvents,
        event,
      ];
    }
  }
}

export default Insanity;
