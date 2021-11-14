import { AnyEvent } from 'parser/core/Events';

/**
 * Helper intended for use by a Normalizer module that fabricates and inserts events into the
 * overall events list. This function marks the given events fabricated and then inserts them
 * in timestamp order into the overall list. When an inserted event has the same timestamp as
 * existing events, it will always be inserted last.
 * @param events all events for analysis - this should be the same as the Normalizer's input.
 *   This function assumes they are already ordered by timestamp.
 * @param insertEvents the events to insert. May be in any order.
 * @return the analysis events with the inserted events added in order
 */
export function insertEvents(events: AnyEvent[], insertEvents: AnyEvent[]): AnyEvent[] {
  // sort the insertEvents by timestamp and mark them fabricated
  insertEvents.forEach((e) => (e.__fabricated = true));
  insertEvents.sort((a, b) => a.timestamp - b.timestamp);
  // iterate through analysis events, inserting insertEvents as we go into new fixedEvents list
  let currInsertIndex = 0;
  const fixedEvents: AnyEvent[] = [];
  events.forEach((event: AnyEvent) => {
    while (
      currInsertIndex < insertEvents.length &&
      insertEvents[currInsertIndex].timestamp < event.timestamp
    ) {
      fixedEvents.push(insertEvents[currInsertIndex]);
      currInsertIndex += 1;
    }
    fixedEvents.push(event);
  });
  while (currInsertIndex < insertEvents.length) {
    fixedEvents.push(insertEvents[currInsertIndex]);
    currInsertIndex += 1;
  }
  return fixedEvents;
}
