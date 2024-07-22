import { Options } from 'parser/core/Analyzer';
import {
  AddRelatedEvent,
  AnyEvent,
  EventType,
  HasAbility,
  HasSource,
  HasTarget,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Combatant from 'parser/core/Combatant';

/**
 * The specification of an event link to apply.
 * By default, the linking event adds the referenced event to its _linkedEvents, but not vice versa.
 * By default, the linked events must have the same timestamp, source, and target.
 */
export type EventLink = {
  /** REQUIRED The key string used to describe the relationship between the events */
  linkRelation: string;
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
  /** If true, the two events may be linked even with different sources.
   * In most cases this should be false, and will default to false when omitted */
  anySource?: boolean;
  /** If true, the two events may be linked even with different targets.
   * In most cases this should be false, and will default to false when omitted */
  anyTarget?: boolean;
  /** If defined, links will also be added from the referenced event to the linking event using this relation. */
  reverseLinkRelation?: string;
  /** If defined, this spec will create at most the given number of links to matching reference events.
   *  This maximum applies only to this spec (not other specs on the same event), and applies
   *  only *from the linkingEvent* (the same referenceEvent can be pointed to any number of times).
   *  Scan for referenced events starts forward from the linking event first, then back
   *  from the linking event, and will stop as soon as the maximum number of links are found.
   *  Usually, including this field will not be needed! Proper time and target constraints should
   *  make false positives impossible - only need to use this when situations require it.
   *  By default, any number of links can be made if they meet the parameters */
  maximumLinks?: number | ((c: Combatant) => number);
  /** If defined, this predicate will also be called with the candidate events and iff false no link will be made */
  additionalCondition?: (linkingEvent: AnyEvent, referencedEvent: AnyEvent) => boolean;
  /** If defined, this predicate will be called with the selected combatant to determine if this
   *  spec should be run. Will be called only once at the start of the normalize function.
   *  Useful if using a list of interdependent specs where some are talent dependent.
   *  Defaults to 'true' when omitted. */
  isActive?: (c: Combatant) => boolean;
};

/**
 * An event normalizer that uses an Event's _linkedEvents field to indicate an association
 * between events. The meaning of this association is context-sensitive and should be clearly
 * documented by any implementer of this class.
 *
 * For example, to indicate that a cast event caused an applybuff event, we might add the cast event
 * as a linked event to the applybuff event with a linkRelation like "FromHardcast".
 */
abstract class EventLinkNormalizer extends EventsNormalizer {
  eventLinks: EventLink[];

  /**
   * Creates a new EventLinkNormalizer that uses the given EventLink specifications.
   * Normalizers included in the CombatLogParser must have only options in their constructor,
   * so the eventLinks should be filled by the extender of this class.
   * @param eventLinks the event link specifications to apply. These links will be applied in
   *   the order they are given, so it's possible to make one link's behavior depend on a previous
   *   link in the list.
   */
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

  /** checks that the referenced event matches the criteria and that the linking and
   * referenced events match each other, then adds the link(s).
   * Returns 1 iff a link is added, and 0 if not. */
  private _checkAndLink(el: EventLink, linkingEvent: AnyEvent, referencedEvent: AnyEvent): number {
    if (
      this._isReferenced(el, referencedEvent) &&
      this._sourceCheck(el, linkingEvent, referencedEvent) &&
      this._targetCheck(el, linkingEvent, referencedEvent) &&
      (!el.additionalCondition || el.additionalCondition(linkingEvent, referencedEvent))
    ) {
      AddRelatedEvent(linkingEvent, el.linkRelation, referencedEvent);
      if (el.reverseLinkRelation !== undefined) {
        AddRelatedEvent(referencedEvent, el.reverseLinkRelation, linkingEvent);
      }
      return 1;
    }
    return 0;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    // check each event link directive
    this.eventLinks.forEach((el: EventLink) => {
      if (!el.isActive || el.isActive(this.selectedCombatant)) {
        // loop through all events in order
        events.forEach((event: AnyEvent, eventIndex: number) => {
          if (event._processedLinks == null) {
            event._processedLinks = new Set<EventLink>();
          } else if (event._processedLinks?.has(el)) {
            return;
          }
          event._processedLinks!.add(el);
          // if we find a match of a linking ability
          if (this._isLinking(el, event)) {
            let linksMade = 0;
            const maxLinks =
              typeof el.maximumLinks == 'function'
                ? el.maximumLinks(this.selectedCombatant)
                : el.maximumLinks;
            // loop forwards up to forwardBuffer and add links
            for (let forwardIndex = eventIndex; forwardIndex < events.length; forwardIndex += 1) {
              const forwardEvent = events[forwardIndex];
              if (
                forwardEvent.timestamp - event.timestamp >
                (el.forwardBufferMs ? el.forwardBufferMs : 0)
              ) {
                break;
              }
              linksMade += this._checkAndLink(el, event, forwardEvent);
              if (maxLinks && maxLinks <= linksMade) {
                return;
              }
            }
            // loop backwards up to backwardBuffer and add links
            for (let backwardIndex = eventIndex; backwardIndex >= 0; backwardIndex -= 1) {
              const backwardEvent = events[backwardIndex];
              if (
                event.timestamp - backwardEvent.timestamp >
                (el.backwardBufferMs ? el.backwardBufferMs : 0)
              ) {
                break;
              }
              linksMade += this._checkAndLink(el, event, backwardEvent);
              if (maxLinks && maxLinks <= linksMade) {
                return;
              }
            }
          }
        });
      }
    });
    return events;
  }
}

export default EventLinkNormalizer;
