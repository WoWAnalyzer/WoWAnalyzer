import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const CAST_BUFFER_MS = 100;
const MUSHROOM_BUFFER_MS = 1_100;

const FROM_HARDCAST = 'FromHardcast';
const HITS_TARGET = 'HitsTarget';

// TODO TWW - add hit count AoE module
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HITS_TARGET,
    linkingEventId: SPELLS.STARFIRE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.STARFIRE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // wild mushroom bursts exactly 1 sec after cast - TODO any danger of overlap if player spams at high haste?
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HITS_TARGET,
    linkingEventId: SPELLS.WILD_MUSHROOM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS_DRUID.WILD_MUSHROOM_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: MUSHROOM_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

/**
 * Some Balance spells are only called for based on the number of targets hit.
 * This normalizer adds a _linkedEvent to the Damage linking back to the Cast event that caused it
 * (if one can be found). This makes it easier to count the number of targets hit.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function hardcastTargetsHit(event: CastEvent): number {
  return GetRelatedEvents(event, HITS_TARGET).length;
}

export default CastLinkNormalizer;
