import SPELLS from 'common/SPELLS/demonhunter';
import { CastEvent, EventType, GetRelatedEvents, RemoveBuffStackEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const SOUL_CONSUME_BUFFER = 50;

const SOUL_CLEAVE_SOUL_CONSUME = 'SoulCleaveSoulConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SOUL_CLEAVE_SOUL_CONSUME,
    referencedEventId: SPELLS.SOUL_FRAGMENT_STACK.id,
    referencedEventType: EventType.RemoveBuffStack,
    linkingEventId: SPELLS.SOUL_CLEAVE.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 2,
  },
];

export default class SoulCleaveEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSoulCleaveSoulConsumptions(event: CastEvent): RemoveBuffStackEvent[] {
  return GetRelatedEvents(event, SOUL_CLEAVE_SOUL_CONSUME).filter(
    (e): e is RemoveBuffStackEvent => e.type === EventType.RemoveBuffStack,
  );
}
