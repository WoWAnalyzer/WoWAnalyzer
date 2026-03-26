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

const DANCE_OF_CHI_JI_CONSUME = 'dance-of-chi-ji-consume';
const CAST_BUFFER_MS = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: DANCE_OF_CHI_JI_CONSUME,
    reverseLinkRelation: DANCE_OF_CHI_JI_CONSUME,
    linkingEventId: SPELLS.SPINNING_CRANE_KICK.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.DANCE_OF_CHI_JI_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

class DanceOfChiJiCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function consumedDanceOfChiJi(
  event: CastEvent | RemoveBuffEvent | RemoveBuffStackEvent,
): boolean {
  return HasRelatedEvent(event, DANCE_OF_CHI_JI_CONSUME);
}

export default DanceOfChiJiCastLinkNormalizer;
