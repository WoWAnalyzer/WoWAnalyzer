import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';

const CAST_BUFFER_MS = 100;

export const FROM_HARDCAST = 'FromHardcast'; // for linking a buffapply or heal to its cast

const EVENT_LINKS: EventLink[] = [
  // Link Prayer of Healing cast to its multiple heal events.
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: [TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id],
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id,
    referencedEventType: [EventType.Heal],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns the heal events caused by the given cast event */
export function getHeals(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, FROM_HARDCAST).filter(
    (e): e is HealEvent => e.type === EventType.Heal,
  );
}

export default CastLinkNormalizer;
