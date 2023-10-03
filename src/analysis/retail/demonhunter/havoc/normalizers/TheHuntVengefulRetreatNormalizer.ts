import TALENTS from 'common/TALENTS/demonhunter';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const THE_HUNT_VENGEFUL_RETREAT_BUFFER = 4000;

const THE_HUNT_AFTER_VENGEFUL_RETREAT = 'TheHuntAfterVengefulRetreat';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: THE_HUNT_AFTER_VENGEFUL_RETREAT,
    referencedEventId: TALENTS.VENGEFUL_RETREAT_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.THE_HUNT_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: THE_HUNT_VENGEFUL_RETREAT_BUFFER,
    anyTarget: true,
  },
];

export default class TheHuntVengefulRetreatNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPreviousVengefulRetreat(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    THE_HUNT_AFTER_VENGEFUL_RETREAT,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).find(Boolean);
}
