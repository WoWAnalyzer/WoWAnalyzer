import { AnyEvent } from 'parser/core/Events';

/**
 * A wrapper to allow easy insertion of multiple new events into an existing event listing.
 *
 * Typically, this will be constructed using the "all events" array passed into a Normalizer module,
 * and then the normalizer can use the wrapper to easily place newly fabricated events without
 * having to worry about handling things in strict order to make the splice work properly.
 */
class InsertableEventsWrapper {
  events: AnyEvent[];
  toAdd: Array<{ event: AnyEvent; index: number }> = [];

  constructor(events: AnyEvent[]) {
    this.events = events;
  }

  /**
   * Inserts the given new event directly after an existing event within the events array.
   * @param newEvent the event to insert. Will be marked as 'fabricated'.
   * @param existingEvent an event in the original events array.
   *   Events previously inserted by this wrapper will *not* be found and should not be passed here.
   */
  addAfterEvent(newEvent: AnyEvent, existingEvent: AnyEvent): void {
    const index = this.events.indexOf(existingEvent);
    if (index === -1) {
      console.error(
        'InsertableEventsWrapper tried to insert after event ' +
          existingEvent +
          " - but it wasn't found in the overall events list! Will be added by time instead.",
      );
      this.addByTime(newEvent);
    } else {
      this.addAfterIndex(newEvent, index);
    }
  }

  /**
   * Inserts the given new event at the appropriate location given its timestamp.
   * Will always be inserted after original events with the same timestamp.
   * @param newEvent the event to insert. Will be marked as 'fabricated'.
   */
  addByTime(newEvent: AnyEvent): void {
    const found = this.events.some((event, index) => {
      if (event.timestamp > newEvent.timestamp) {
        // 'some' short circuits on the first true return, so this should only ever insert one
        this.addAfterIndex(newEvent, Math.max(0, index - 1));
        return true;
      } else {
        return false;
      }
    });
    if (!found) {
      this.addAfterIndex(newEvent, this.events.length - 1);
    }
  }

  /**
   * Inserts the given new event directly after the given index in the original array.
   * @param newEvent the event to insert. Will be marked as 'fabricated'.
   * @param index the index into the original array to insert after.
   *   Only considers the original array, vvents previously inserted by this wrapper will *not* be
   *   considered by this index.
   */
  addAfterIndex(newEvent: AnyEvent, index: number): void {
    newEvent.__fabricated = true;
    this.toAdd.push({ event: newEvent, index });
  }

  /**
   * Builds and returns a new array from the original events plus the newly inserted ones.
   */
  build(): AnyEvent[] {
    // sort toAdd list to be in order by insert index
    this.toAdd.sort((a, b) => a.index - b.index);
    let currToAdd = 0;

    const newEvents: AnyEvent[] = [];
    this.events.forEach((event: AnyEvent, index: number) => {
      newEvents.push(event);
      while (currToAdd < this.toAdd.length && this.toAdd[currToAdd].index === index) {
        newEvents.push(this.toAdd[currToAdd].event);
        currToAdd += 1;
      }
    });

    return newEvents;
  }
}

export default InsertableEventsWrapper;
