import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType, HasAbility, HasTarget } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

abstract class EventSwapNormalizer extends EventsNormalizer {

  swaps: EventSwap[];

  constructor(options: Options, swaps: EventSwap[]) {
    super(options);
    this.swaps = swaps;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent, eventIndex: number) => {
      fixedEvents.push(event);

      // check for matches of the 'before' ability
      this.swaps.forEach((swap: EventSwap) => {
        if (event.type === swap.beforeEventType && HasAbility(event) && HasTarget(event) && event.ability.guid === swap.beforeEventId) {
          const spellId = event.ability.guid;
          const castTimestamp = event.timestamp;
          if (!event.targetID) {
            return;
          }

          // loop backwards through the event history to look for matches of the 'after' ability within the buffer period
          for (
            let previousEventIndex = eventIndex;
            previousEventIndex >= 0;
            previousEventIndex -= 1
          ) {
            const previousEvent = fixedEvents[previousEventIndex];
            if (castTimestamp - previousEvent.timestamp > swap.bufferMs) {
              break;
            }
            if (
              previousEvent.type === swap.afterEventType && HasAbility(previousEvent) && HasTarget(previousEvent) &&
              previousEvent.ability.guid === spellId &&
              previousEvent.targetID === event.targetID
            ) {
              fixedEvents.splice(previousEventIndex, 1);
              fixedEvents.push(previousEvent);
              previousEvent.__modified = true;
              break;
            }
          }
        }
      });
    });

    return fixedEvents;
  }


}

// TODO spec
export interface EventSwap {
  beforeEventId: number;
  beforeEventType: EventType;
  afterEventId: number;
  afterEventType: EventType;
  bufferMs: number;
}
