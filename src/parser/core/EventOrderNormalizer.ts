import { MappedEvent, EventType, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const DEBUG = false;

/**
 * An event normalizer that enforces the ordering of paired events that happen simultaneously
 * in order to ease further analysis.
 *
 * For example, an instant-ticking HoT would have a cast event followed by an applybuff event
 * followed by a heal event all with the same target, but not nescesarily in that order.
 * This normalizer could be used to enfore that order.
 */
abstract class EventOrderNormalizer extends EventsNormalizer {
  eventOrders: EventOrder[];

  /**
   * @param options the module options
   * @param eventOrders the event orderings to apply. They will be applied in the same order they are listed.
   * @protected
   */
  protected constructor(options: Options, eventOrders: EventOrder[]) {
    super(options);
    this.eventOrders = eventOrders;
  }

  // detects if the given event matches all the conditions of the 'before' event
  private _isBefore(eo: EventOrder, event: MappedEvent): boolean {
    const matchesType: boolean = Array.isArray(eo.beforeEventType)
      ? eo.beforeEventType.includes(event.type)
      : eo.beforeEventType === event.type;
    const matchesId: boolean =
      eo.beforeEventId == null ||
      (HasAbility(event) &&
        (typeof eo.beforeEventId === 'number'
          ? eo.beforeEventId === event.ability.guid
          : eo.beforeEventId.includes(event.ability.guid)));
    return matchesType && matchesId;
  }

  // detects if the given event matches all the conditions of the 'after' event
  private _isAfter(eo: EventOrder, event: MappedEvent): boolean {
    const matchesType: boolean = Array.isArray(eo.afterEventType)
      ? eo.afterEventType.includes(event.type)
      : eo.afterEventType === event.type;
    const matchesId: boolean =
      eo.afterEventId == null ||
      (HasAbility(event) &&
        (typeof eo.afterEventId === 'number'
          ? eo.afterEventId === event.ability.guid
          : eo.afterEventId.includes(event.ability.guid)));
    return matchesType && matchesId;
  }

  // detects if the events must match source, and if so if their sources match
  private _sourceCheck(eo: EventOrder, event1: MappedEvent, event2: MappedEvent): boolean {
    return (
      eo.anySource ||
      (HasSource(event1) && HasSource(event2) && event1.sourceID === event2.sourceID)
    );
  }

  // detects if the events must match target, and if so if their targets match
  private _targetCheck(eo: EventOrder, event1: MappedEvent, event2: MappedEvent): boolean {
    return (
      eo.anyTarget ||
      (HasTarget(event1) &&
        HasTarget(event2) &&
        encodeEventTargetString(event1) === encodeEventTargetString(event2))
    );
  }

  normalize(events: MappedEvent[]): MappedEvent[] {
    // check each event order directive
    this.eventOrders.forEach((eo: EventOrder) => {
      const fixedEvents: MappedEvent[] = [];
      // loop through all events in order
      events.forEach((event: MappedEvent, eventIndex: number) => {
        fixedEvents.push(event);
        // if we find a match of the 'before' ability
        if (this._isBefore(eo, event)) {
          // loop backwards through the event history for matches of the 'after' ability within the buffer period
          for (
            let previousEventIndex = eventIndex;
            previousEventIndex >= 0;
            previousEventIndex -= 1
          ) {
            const previousEvent = fixedEvents[previousEventIndex];
            if (event.timestamp - previousEvent.timestamp > (eo.bufferMs ? eo.bufferMs : 0)) {
              break;
            }
            if (
              this._isAfter(eo, previousEvent) &&
              this._sourceCheck(eo, event, previousEvent) &&
              this._targetCheck(eo, event, previousEvent)
            ) {
              fixedEvents.splice(previousEventIndex, 1);
              fixedEvents.push(previousEvent);
              if (eo.updateTimestamp) {
                previousEvent.timestamp = event.timestamp;
                previousEvent.__modified = true;
              }
              previousEvent.__reordered = true;
              DEBUG &&
                console.log(
                  `REORDER - index ${previousEventIndex} to ${eventIndex}`,
                  event,
                  previousEvent,
                );
              break;
            }
          }
        }
      });
      // the 'fixedEvents' output becames the new 'events'
      events = fixedEvents;
    });

    return events;
  }
}

export default EventOrderNormalizer;

/**
 * The specification of an event ordering to apply.
 * The 'after' event will always be moved forward to be in front of the 'before' event.
 * By default, the reordered events must have the same timestamp, source, and target.
 *
 * As EventOrders are applied in the order specified, to enforce a multi-event ordering
 * e.g. "A, B, C" you must pass them in back to front e.g. [A, B] them [B, C] in order
 * for it to work in all cases.
 */
export type EventOrder = {
  /** REQUIRED The ability id or ids of the event that should come before
   * Null will match ANY event ID and should be reserved for special event types */
  beforeEventId: null | number | number[];
  /** REQUIRED The type or types of the event that should come before */
  beforeEventType: EventType | EventType[];
  /** REQUIRED The ability id or ids of the event that should come after.
   * Null will match ANY event ID and should be reserved for special event types */
  afterEventId: null | number | number[];
  /** REQUIRED The type or types of the event that should come after */
  afterEventType: EventType | EventType[];
  /** The maximum allowed timestamp difference for a re-order to be made.
   * Should be set to the minimum possible value to avoid false positives.
   * Defaults to 0 ms when omitted. */
  bufferMs?: number;
  /** If true, the two events may be swapped even with different sources.
   * In most cases this should be false, and will default to false when omitted */
  anySource?: boolean;
  /** If true, the two events may be swapped even with different targets.
   * In most cases this should be false, and will default to false when omitted */
  anyTarget?: boolean;
  /** If true, and the reordered events have different timestamps,
   * the 'after' event will have its timestamp pushed forward to match the 'before' event.
   * Defaults to 'false' when omitted. */
  updateTimestamp?: boolean;
};
