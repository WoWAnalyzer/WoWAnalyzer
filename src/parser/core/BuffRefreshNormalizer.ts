import { AnyEvent, EventType } from './Events';
import EventsNormalizer from './EventsNormalizer';
import { Options } from './Module';

/**
 * Helper to create a normalizer that merges RemoveBuff and ApplyBuff events
 * into a single RefreshBuff event within a specified time buffer.
 *
 * This can help clean up the event stream and make it easier to analyze.
 */
abstract class BuffRefreshNormalizer extends EventsNormalizer {
  private readonly abilities: readonly number[];
  private readonly bufferMs: number;

  constructor(options: Options, abilities: number | readonly number[], bufferMs = 50) {
    super(options);
    this.abilities = Object.freeze(Array.isArray(abilities) ? abilities : [abilities]);
    this.bufferMs = bufferMs;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const newEvents = [...events];

    for (let i = 0; i < newEvents.length - 1; i += 1) {
      const mainEvent = newEvents[i];

      if (
        mainEvent.type === EventType.RemoveBuff &&
        this.abilities.includes(mainEvent.ability.guid)
      ) {
        // Look forward in time to find the matching ApplyBuff event.
        for (let j = i + 1; j < newEvents.length; j += 1) {
          const e = newEvents[j];

          if (e.timestamp - mainEvent.timestamp > this.bufferMs) {
            // Buffer time has elapsed, give up.
            break;
          }

          if (e.type === EventType.ApplyBuff && e.ability.guid === mainEvent.ability.guid) {
            // Found it, replace the RemoveBuff event with a RefreshBuff event.
            newEvents[i] = {
              ...e,
              timestamp: mainEvent.timestamp,
              type: EventType.RefreshBuff,
              __modified: true,
            };

            // Remove the ApplyBuff event.
            newEvents.splice(j, 1);
            break;
          }
        }
      }
    }

    return newEvents;
  }
}

export default BuffRefreshNormalizer;
