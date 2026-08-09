import TALENTS from 'common/TALENTS/evoker';
import { AnyEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

const INVALID_DRAGONRAGE_REMOVE = 'InvalidDragonrageRemove';
const INVALID_DRAGONRAGE_REMOVE_BUFFER_MS = 50; // Biggest observed diff was 1ms but no harm in making it a bit larger

const EVENT_LINKS: EventLink[] = [
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

/** This Normalizer fixes an issue that happens very sporadically, where Dragonrage gets removed and reapplied on the same tick.
 * This is has no effect on actual gameplay and will just mess up the analyzers (Likely some hallucination by the log).
 * As a remedy we just remove both events.
 * Issue is visible in the following log (also applies to the other fight in the log):
 * https://www.warcraftlogs.com/reports/bmZzt7RXcAq9KMW6?fight=1&type=auras&source=4&ability=375087&view=events
 * */
class DragonrageNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent) => {
      if (
        (event.type !== EventType.RemoveBuff && event.type !== EventType.ApplyBuff) ||
        event.ability.guid !== TALENTS.DRAGONRAGE_TALENT.id ||
        !HasRelatedEvent(event, INVALID_DRAGONRAGE_REMOVE)
      ) {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default DragonrageNormalizer;
