import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 65;
const TRANQ_CHANNEL_BUFFER_MS = 10_000;

export const APPLIED_HEAL = 'AppliedHeal';
export const FROM_HARDCAST = 'FromHardcast';
export const FROM_OVERGROWTH = 'FromOvergrowth';
export const FROM_EXPIRING_LIFEBLOOM = 'FromExpiringLifebloom';
export const CAUSED_TICK = 'CausedTick';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.REJUVENATION.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.REGROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    referencedEventId: SPELLS.REGROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.LIFEBLOOM_HOT_HEAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.WILD_GROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.WILD_GROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.SWIFTMEND.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.SWIFTMEND.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.FLOURISH_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.FLOURISH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    // for discerning hardcasts from T28 4pc procs
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.INCARNATION_TOL_ALLOWED.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_OVERGROWTH,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
      SPELLS.REGROWTH.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.OVERGROWTH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_EXPIRING_LIFEBLOOM,
    linkingEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id],
    referencedEventType: [EventType.RefreshBuff, EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: CAUSED_TICK,
    linkingEventId: SPELLS.TRANQUILITY_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TRANQUILITY_HEAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: TRANQ_CHANNEL_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/Heal linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for the buffs Rejuvenation, Regrowth, Wild Growth, Lifebloom,
 * and for the direct heals of Swiftmend and Regrowth, and the self buff from Flourish.
 * A special link key is used when the HoTs were applied by an Overgrowth cast instead of a normal hardcast.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function isFromOvergrowth(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_OVERGROWTH);
}

export function getHeals(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, APPLIED_HEAL);
}

export function isFromExpiringLifebloom(event: HealEvent): boolean {
  return HasRelatedEvent(event, FROM_EXPIRING_LIFEBLOOM);
}

export function getTranquilityTicks(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, CAUSED_TICK);
}

export default CastLinkNormalizer;
