import SPELLS from 'common/SPELLS';
import { AnyEvent, Event, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

class TipOfTheSpearNormalizer extends EventsNormalizer {
  /**
   * Tip of the Spear casts a buff on the player whenever he casts Kill Command. It's cluttering up the console, so tagging it as a tick fixes this issue. Since we can track the actual buff application, it's not a problem for further analysis.
   *
   * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16
   *
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event) => {
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.TIP_OF_THE_SPEAR_CAST.id) {
        (event as Event<any>).type = 'tick';
        event.__modified = true;
      }
      fixedEvents.push(event);
    });

    return fixedEvents;
  }
}

export default TipOfTheSpearNormalizer;
