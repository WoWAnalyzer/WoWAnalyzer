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

const RUSHING_WIND_KICK_CONSUME = 'rushing-wind-kick-consume';
const CAST_BUFFER_MS = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: RUSHING_WIND_KICK_CONSUME,
    reverseLinkRelation: RUSHING_WIND_KICK_CONSUME,
    linkingEventId: [SPELLS.RUSHING_WIND_KICK_CAST.id, SPELLS.RUSHING_WIND_KICK_DAMAGE.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.RUSHING_WIND_KICK_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

class RushingWindKickCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function consumedRushingWindKick(
  event: CastEvent | RemoveBuffEvent | RemoveBuffStackEvent,
): boolean {
  return HasRelatedEvent(event, RUSHING_WIND_KICK_CONSUME);
}

export default RushingWindKickCastLinkNormalizer;
