import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { HasRelatedEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { TIERS } from 'game/TIERS';

const VB = 'VoidBolt';
const PI = 'PowerInfusion';
const castVB = 'VoidBoltDamageEventWithCast';
const castPI = 'PowerInfusionCausedByVoidBolt';

const VB_TRAVEL_BUFFER_MS = 2500; // long buffer to look for damage events to be safe, but void bolts cooldown is longer so its ok.
//Importantly, it shouldn't be possible for a void bolt to hit sooner than the previous void bolt,

/*
  This is for finding void bolt damage events without cast events.
  Such voidbolts are caused by Jackpot! from Shadow's TWW Season 2 2-set
  Since there is nothing in the logs to show when a Jackpot! is happneing, we are using a linking event to link each cast of VB to a VB damage event. 
  The damage events that do not have a linking cast event, are Jackpots!

TODO: Try to fix Power Infusion Casts from Jackpots!

  Jackpot! also causes a Power Infusion cast with Shadow's TWW Season 2 4-set.
  This causes problems for tracking Power Infusion usage, so we want to link these Jackpot! PI casts to the Jackpots! using the Voidbolts without damage events.
  
  I don't think it is possible to distinguish these casts from normal PI casts.

  When PI is cast, it always has a cast event.
  When PI is created by a Jackpot! it has a cast event if you do not alreay have the PI buff, and it has no event if you do have the PI buff.
  There is also no refresh buff event to look at either.

  Example:
  Case 1: Power Infusion is not Cast, there is a Jackpot!
    Log: PI cast event, VB
  Case 2: Power Infusion is Cast, then a Jackpot! occurs
    Log: PI cast event, VB


  In case 2, we do not want to link these events together, because that is a PI cast, not a jackpot cast event.
  In Case 1, we want to link these events together, because that is a Jackpot PI cast.

  And since we always get a Jackpot during dark ascension, and cast PI every other dark ascension, these cases comes up a lot.

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
      return c.has2PieceByTier(TIERS.TWW2);
    },
  },
  {
    linkRelation: PI,
    linkingEventId: TALENTS.POWER_INFUSION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.VOID_BOLT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: VB_TRAVEL_BUFFER_MS,
    backwardBufferMs: 0,
    reverseLinkRelation: castPI,
    anyTarget: true,
    maximumLinks: 1, // The voidbolt can only cause one cast of PI.
    isActive(c) {
      return c.has4PieceByTier(TIERS.TWW2);
    },
    additionalCondition: (referencedEvent) => !HasRelatedEvent(referencedEvent, castVB), //If the voidbolt did not have a cast event, it is a Jackpot
  },
];

export default class ShadowTierTWWS2Normalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}
