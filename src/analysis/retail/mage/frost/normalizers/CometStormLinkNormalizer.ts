import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { MappedEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 2500;

export const FROM_HARDCAST = 'FromHardcast';
export const HITS_TARGET = 'HitsTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.COMET_STORM_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS.COMET_STORM_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    reverseLinkRelation: HITS_TARGET,
  },
];

//Links the damage events from the Comet Storm Talent to their cast event. Used to count targets hit and projectiles shattered.
class CometStormLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function cometStormHits(event: MappedEvent) {
  return GetRelatedEvents(event, HITS_TARGET);
}

export default CometStormLinkNormalizer;
