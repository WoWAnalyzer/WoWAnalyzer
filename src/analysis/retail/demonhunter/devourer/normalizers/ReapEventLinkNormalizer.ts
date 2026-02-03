import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

const SOUL_CONSUME_BUFFER = 150;

const REAP_SOUL_CONSUME = 'ReapSoulConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: REAP_SOUL_CONSUME,
    referencedEventId: SPELLS.SOUL_FRAGMENT_DEVOUR.id,
    referencedEventType: EventType.RemoveBuffStack,
    linkingEventId: SPELLS.REAP.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 10,
  },
  {
    linkRelation: REAP_SOUL_CONSUME,
    referencedEventId: SPELLS.SOUL_FRAGMENT_DEVOUR.id,
    referencedEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.REAP.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
  },
];

export default class ReapEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getReapSoulConsumptions(
  event: CastEvent,
): (RemoveBuffStackEvent | RemoveBuffEvent)[] {
  return GetRelatedEvents(
    event,
    REAP_SOUL_CONSUME,
    (e): e is RemoveBuffStackEvent | RemoveBuffEvent =>
      e.type === EventType.RemoveBuffStack || e.type === EventType.RemoveBuff,
  );
}
