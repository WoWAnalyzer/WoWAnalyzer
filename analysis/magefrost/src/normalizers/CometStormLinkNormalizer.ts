import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 2500;

export const FROM_HARDCAST = 'FromHardcast';
export const HITS_TARGET = 'HitsTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.COMET_STORM_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.COMET_STORM_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    reverseLinkRelation: HITS_TARGET,
  },
];

class CometStormLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromHardcast(event: DamageEvent): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function hardcastTargetsHit(event: CastEvent): number {
  return GetRelatedEvents(event, HITS_TARGET).length;
}

export default CometStormLinkNormalizer;
