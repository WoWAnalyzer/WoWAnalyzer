import TALENTS from 'common/TALENTS/evoker';
import { AnyEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

const INVALID_DRAGONRAGE_REMOVE = 'InvalidDragonrageRemove';
const INVALID_DRAGONRAGE_REMOVE_BUFFER_MS = 50; // Biggest observed diff was 1ms but no harm in making it a bit larger

const EVENT_LINKS: EventLink[] = [
  /** Dragonrage gets removed and reapplied on the same tick.
   * https://www.warcraftlogs.com/reports/bmZzt7RXcAq9KMW6?fight=1&type=auras&source=4&ability=375087&view=events
   * */
  {
    linkRelation: INVALID_DRAGONRAGE_REMOVE,
    reverseLinkRelation: INVALID_DRAGONRAGE_REMOVE,
    linkingEventId: TALENTS.DRAGONRAGE_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS.DRAGONRAGE_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: INVALID_DRAGONRAGE_REMOVE_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.DRAGONRAGE_TALENT),
  },
];

/** This Normalizer fixes all the random log tidbits that are generally hindering to work around, by removing them.
 * */
class InvalidEventRemover extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const normalizedEvents = super.normalize(events);
    const filteredEvents: AnyEvent[] = [];
    normalizedEvents.forEach((e) => {
      if (!hasFlaggedEvent(e)) {
        filteredEvents.push(e);
      }
    });

    return filteredEvents;
  }
}

/** Eventlinks recorded in this will trigger the linked events to be removed because they are invalid, useless or hindering. */
const flaggedEvents = [
  { eventType: EventType.RemoveBuff, link: INVALID_DRAGONRAGE_REMOVE },
  { eventType: EventType.ApplyBuff, link: INVALID_DRAGONRAGE_REMOVE },
];

function hasFlaggedEvent(event: AnyEvent) {
  for (const fe of flaggedEvents) {
    if (fe.eventType === event.type && HasRelatedEvent(event, fe.link)) {
      return true;
    }
  }

  return false;
}

export default InvalidEventRemover;
