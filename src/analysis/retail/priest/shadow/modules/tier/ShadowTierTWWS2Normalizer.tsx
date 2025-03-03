import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, AnyEvent, CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { HasRelatedEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { TIERS } from 'game/TIERS';

const VB = 'VoidBolt';
const PI = 'PowerInfusionCast';
const castVB = 'VoidBoltDamageEventWithCast';

const PI_BUFFER_MS = 50;
const VB_TRAVEL_BUFFER_MS = 2500; // long buffer to look for damage events to be safe, but void bolts cooldown is longer so its ok.
//Importantly, it shouldn't be possible for a void bolt to hit sooner than the previous void bolt,

/*
  Free Voidbolts are caused by Jackpot! from Shadow's TWW Season 2 2-set
  These voidbolts have a damage event, but no cast event.
  Since there is nothing in the logs to show when a Jackpot! is happneing, we are using a linking event to link each cast of VB to a VB damage event. 
  The damage events that do not have a linking cast event, are Jackpots!

  Jackpot! also grants Power Infusion with Shadow's TWW Season 2 4-set.
  It causes a PI cast, unless you are already under the effects of Power Infusion.
  This makes it impossible to tell if it is a real PI cast or a free PI cast in some cases.

  However, due to the talent Twins of the Sun Priestess, every true cast of PI also causes another target in the group gaining PI while Jackpot! PI does not.
  This assumes that the priest will have at least one friendly player in range, and will take this talent for this to work.
  I think this is very safe for most situations.
  So we pair PI casts to PI buff events, and a PI cast without a PI buff event on a different target is a Jackpot! PI
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
    referencedEventId: TALENTS.POWER_INFUSION_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: PI_BUFFER_MS,
    backwardBufferMs: PI_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.has4PieceByTier(TIERS.TWW2);
    },
    additionalCondition: (linkingEvent, referencedEvent) => otherTarget(referencedEvent),
  },
];

function otherTarget(event: AnyEvent) {
  //If the event has a different target than its source, this returns true.
  if (event.type === EventType.ApplyBuff) {
    //should always be true
    if (event.sourceID !== event.targetID) {
      return true;
    }
  }
  return false;
}

function isFreePI(event: CastEvent): boolean {
  //Is a free PI if it has not been cast on another target.
  return !HasRelatedEvent(event, PI);
}

export default class ShadowTierTWWS2Normalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);
    for (const event of events) {
      if (
        event.type === EventType.Cast &&
        event.ability.guid === TALENTS.POWER_INFUSION_TALENT.id &&
        isFreePI(event)
      ) {
        (event as AnyEvent).type = EventType.FreeCast;
        event.__modified = true;
      }
    }
    return events;
  }
}
