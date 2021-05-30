import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/EnemyInstances';

/**
 * An event normalizer that uses an Event's _linkedEvents field to indicate an association
 * between events. The meaning of this association is context sensitive and should be clearly
 * documented by any implementer of this class.
 *
 * For example, to indicate that a cast event caused an applybuff event, we might add the cast event
 * as a linked event to the applybuff event.
 */
abstract class EventLinkNormalizer extends EventsNormalizer {
  eventLinks: EventLink[];

  protected constructor(options: Options, eventLinks: EventLink[]) {
    super(options);
    this.eventLinks = eventLinks;
  }

  // detects if the given event matches all the conditions of the 'linking' event
  private _isLinking(el: EventLink, event: AnyEvent): boolean {
    const matchesType: boolean = Array.isArray(el.linkingEventType)
      ? el.linkingEventType.includes(event.type)
      : el.linkingEventType === event.type;
    const matchesId: boolean =
      el.linkingEventId == null ||
      (HasAbility(event) &&
        (typeof el.linkingEventId === 'number'
          ? el.linkingEventId === event.ability.guid
          : el.linkingEventId.includes(event.ability.guid)));
    return matchesType && matchesId;
  }

  // detects if the given event matches all the conditions of the 'referenced' event
  private _isReferenced(el: EventLink, event: AnyEvent): boolean {
    const matchesType: boolean = Array.isArray(el.referencedEventType)
      ? el.referencedEventType.includes(event.type)
      : el.referencedEventType === event.type;
    const matchesId: boolean =
      el.referencedEventId == null ||
      (HasAbility(event) &&
        (typeof el.referencedEventId === 'number'
          ? el.referencedEventId === event.ability.guid
          : el.referencedEventId.includes(event.ability.guid)));
    return matchesType && matchesId;
  }

  // detects if the events must match source, and if so if their sources match
  private _sourceCheck(el: EventLink, event1: AnyEvent, event2: AnyEvent): boolean {
    return (
      el.anySource ||
      (HasSource(event1) && HasSource(event2) && event1.sourceID === event2.sourceID)
    );
  }

  // detects if the events must match target, and if so if their targets match
  private _targetCheck(el: EventLink, event1: AnyEvent, event2: AnyEvent): boolean {
    return (
      el.anyTarget ||
      (HasTarget(event1) &&
        HasTarget(event2) &&
        encodeEventTargetString(event1) === encodeEventTargetString(event2))
    );
  }

  // checks that the referenced event matches the criteria and that the linking and referenced events
  // match each other, then adds the link(s)
  private _checkAndLink(el: EventLink, linkingEvent: AnyEvent, referencedEvent: AnyEvent): void {
    if (
      this._isReferenced(el, referencedEvent) &&
      this._sourceCheck(el, linkingEvent, referencedEvent) &&
      this._targetCheck(el, linkingEvent, referencedEvent)
    ) {
      // check and link
      if (linkingEvent._linkedEvents === undefined) {
        linkingEvent._linkedEvents = {};
      }
      if (linkingEvent._linkedEvents[el.linkKey] !== undefined) {
        console.warn(
          'Linking events with key ' +
            el.linkKey +
            ' - but the key was already defined!' +
            ' Linkers have probably been specified wrong. The old link will be overwritten.',
          el,
          linkingEvent,
          linkingEvent._linkedEvents[el.linkKey],
        );
      }
      linkingEvent._linkedEvents[el.linkKey] = referencedEvent;
      linkingEvent.__modified = true;

      // do reverse link if needed
      if (el.reverseLinkKey !== undefined) {
        if (referencedEvent._linkedEvents === undefined) {
          referencedEvent._linkedEvents = {};
        }
        if (referencedEvent._linkedEvents[el.reverseLinkKey] !== undefined) {
          console.warn(
            'Linking events with reverse key ' +
              el.reverseLinkKey +
              ' - but the key was already defined!' +
              ' Linkers have probably been specified wrong. The old link will be overwritten.',
            el,
            referencedEvent,
            referencedEvent._linkedEvents[el.reverseLinkKey],
          );
        }
        referencedEvent._linkedEvents[el.reverseLinkKey] = linkingEvent;
        referencedEvent.__modified = true;
      }
    }
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    // loop through all events in order
    events.forEach((event: AnyEvent, eventIndex: number) => {
      // check each event link directive
      this.eventLinks.forEach((el: EventLink) => {
        // if we find a match of a linking ability
        if (this._isLinking(el, event)) {
          // loop forwards up to forwardBuffer and add links
          for (let forwardIndex = eventIndex; forwardIndex < events.length; forwardIndex += 1) {
            const forwardEvent = events[forwardIndex];
            if (
              forwardEvent.timestamp - event.timestamp >
              (el.forwardBufferMs ? el.forwardBufferMs : 0)
            ) {
              break;
            }
            this._checkAndLink(el, event, forwardEvent);
          }
          for (let backwardIndex = eventIndex; backwardIndex >= 0; backwardIndex -= 1) {
            const backwardEvent = events[backwardIndex];
            if (
              event.timestamp - backwardEvent.timestamp >
              (el.backwardBufferMs ? el.backwardBufferMs : 0)
            ) {
              break;
            }
            this._checkAndLink(el, event, backwardEvent);
          }
          // loop backwards up to backwardBuffer and add links
        }
      });
    });
    return events;
  }
}

/**
 * The specification of an event link to apply.
 * By default, the linking event adds the referenced event to its _linkedEvents, but not vice versa.
 * By default, the linked events must have the same timestamp, source, and target.
 */
export type EventLink = {
  /** REQUIRED The key with which to add the link */
  linkKey: string;
  /** REQUIRED The ability id or ids of the event that is adding link(s)
   * Null will match ANY event ID and should be reserved for special event types */
  linkingEventId: null | number | number[];
  /** REQUIRED The type or types of the event that is adding link(s) */
  linkingEventType: EventType | EventType[];
  /** REQUIRED The ability id or ids of the event that is being referenced
   * Null will match ANY event ID and should be reserved for special event types */
  referencedEventId: null | number | number[];
  /** REQUIRED The type or types of the event that is being referenced */
  referencedEventType: EventType | EventType[];
  /** The maximum allowed timestamp difference *forward in time from the linking event to the
   * referenced event* in order for a link to be made. Defaults to 0 ms when omitted. */
  forwardBufferMs?: number;
  /** The maximum allowed timestamp difference *backward in time from the linking event to the
   * referenced event* in order for a link to be made. Defaults to 0 ms when omitted. */
  backwardBufferMs?: number;
  /** Iff true, the two events may be linked even with different sources.
   * In most cases this should be false, and will default to false when omitted */
  anySource?: boolean;
  /** Iff true, the two events may be linked even with different targets.
   * In most cases this should be false, and will default to false when omitted */
  anyTarget?: boolean;
  /** Iff defined, links will also be added from the referenced event to the linking event using this key. */
  reverseLinkKey?: string;
};

export default EventLinkNormalizer;
