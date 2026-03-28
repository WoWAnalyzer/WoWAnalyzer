import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  HasRelatedEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

const COMBO_BREAKER_CONSUME = 'combo-breaker-consume';
const CAST_BUFFER_MS = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: COMBO_BREAKER_CONSUME,
    reverseLinkRelation: COMBO_BREAKER_CONSUME,
    linkingEventId: [SPELLS.BLACKOUT_KICK.id, SPELLS.BLACKOUT_KICK_TOTM.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.COMBO_BREAKER_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

class ComboBreakerCastLinkNormalizer extends EventLinkNormalizer {
  priority = -100;

  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function consumedComboBreaker(
  event: CastEvent | RemoveBuffEvent | RemoveBuffStackEvent,
): boolean {
  return HasRelatedEvent(event, COMBO_BREAKER_CONSUME);
}

export default ComboBreakerCastLinkNormalizer;
