import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
const VB = 'VoidBolt';
const castVB = 'VoidBoltDamageEventWithCast';

const VB_TRAVEL_BUFFER_MS = 2500; // long buffer to look for damage events to be safe, but void bolts cooldown is longer so its ok.
//Importantly, it shouldn't be possible for a void bolt to hit sooner than the previous void bolt,

/*
  This is for finding void bolts damage events without cast events.
  Such voidbolts are caused by Shadow's TWW Season 2 2-set
*/
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VB,
    linkingEventId: SPELLS.VOID_BOLT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.VOID_BOLT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: VB_TRAVEL_BUFFER_MS,
    backwardBufferMs: 0,
    reverseLinkRelation: castVB,
    maximumLinks: 1, // each cast event can have at most 1 damage event.
    isActive(c) {
      return c.has4PieceByTier(TIERS.TWW2);
    },
  },
];

export default class ShadowTierTWWS2Normalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}
