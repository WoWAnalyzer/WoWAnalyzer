import { consumedComboBreaker } from 'analysis/retail/monk/windwalker/normalizers/ComboBreakerCastLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  HasRelatedEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';

const RUSHING_WIND_KICK_GENERATED = 'rushing-wind-kick-generated';
const GENERATION_BUFFER_MS = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: RUSHING_WIND_KICK_GENERATED,
    reverseLinkRelation: RUSHING_WIND_KICK_GENERATED,
    linkingEventId: SPELLS.BLACKOUT_KICK.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.RUSHING_WIND_KICK_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    forwardBufferMs: GENERATION_BUFFER_MS,
    backwardBufferMs: GENERATION_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition: (linkingEvent) => consumedComboBreaker(linkingEvent as CastEvent),
  },
];

class RushingWindKickGenerationNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function generatedRushingWindKick(
  event: CastEvent | ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent,
): boolean {
  return HasRelatedEvent(event, RUSHING_WIND_KICK_GENERATED);
}

export default RushingWindKickGenerationNormalizer;
