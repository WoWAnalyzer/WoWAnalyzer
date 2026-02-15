import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const WILDFIRE_BOMB_CAST_IMPACT = 'wildfire-bomb-cast-impact';
export const WILDFIRE_BOMB_CAST_DOT = 'wildfire-bomb-cast-dot';

const IMPACT_BUFFER_MS = 2000;
// No Link for the DoT because it ignites and I haven't found a reason to link the dot to the cast

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: WILDFIRE_BOMB_CAST_IMPACT,
    reverseLinkRelation: WILDFIRE_BOMB_CAST_IMPACT,
    linkingEventId: TALENTS.WILDFIRE_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.WILDFIRE_BOMB_IMPACT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: IMPACT_BUFFER_MS,
    anyTarget: true,
  },
];

class WildfireBombNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default WildfireBombNormalizer;
