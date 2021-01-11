import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

const debug = false;

class AimedShotPrepullNormalizer extends EventsNormalizer {

  /**
   * Aimed Shot can begin casting before combat.
   * This means we don't see the begincast event, and only the cast success event.
   * This means our regular PrepullNormalizer won't fix it properly, and thus this normalizer will fabricate begincast events for any cast success events of Aimed Shot that don't have a preceding begincast event.
   */

  normalize(events) {
    const fixedEvents = [];
    let lastBeginCastTimestamp = null;
    events.forEach(event => {
      if ((event.type === EventType.BeginCast || event.type === EventType.Cast) && event.ability.guid === SPELLS.AIMED_SHOT.id) {
        if (event.type === EventType.BeginCast) {
          lastBeginCastTimestamp = event.timestamp;
        }
        if (event.type === EventType.Cast) {
          if (lastBeginCastTimestamp === null) {
            debug && console.log('Aimed Shot without a Begin Cast registered', (event.timestamp - this.owner.fight.start_time) / 1000, 'seconds into combat');

            const fabricatedEvent = {
              ...event,
              timestamp: this.owner.fight.start_time,
              type: EventType.BeginCast,
              __fabricated: true,
            };
            fixedEvents.push(fabricatedEvent);
            debug && console.log('Real', event);
            debug && console.log('Fabricated', fabricatedEvent);

          }
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }

}

export default AimedShotPrepullNormalizer;
