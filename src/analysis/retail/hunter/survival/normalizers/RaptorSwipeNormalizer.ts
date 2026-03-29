import SPELLS from 'common/SPELLS/hunter';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const RAPTOR_SWIPE_CAST_IMPACT = 'raptor-swipe-cast-impact';
export const RAPTOR_SWIPE_STRIKE_AS_ONE = 'raptor-swipe-strike-as-one';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: RAPTOR_SWIPE_CAST_IMPACT,
    reverseLinkRelation: RAPTOR_SWIPE_CAST_IMPACT,
    linkingEventId: SPELLS.RAPTOR_SWIPE_DAMAGE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.RAPTOR_SWIPE_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: 100,
    anyTarget: true,
  },
  {
    linkRelation: RAPTOR_SWIPE_STRIKE_AS_ONE,
    reverseLinkRelation: RAPTOR_SWIPE_STRIKE_AS_ONE,
    linkingEventId: SPELLS.RAPTOR_SWIPE_DAMAGE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.STRIKE_AS_ONE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: 300,
    anyTarget: true,
    anySource: true,
  },
];

class RaptorSwipeNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default RaptorSwipeNormalizer;
