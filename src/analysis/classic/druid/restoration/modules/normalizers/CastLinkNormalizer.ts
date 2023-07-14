import SPELLS from 'common/SPELLS/classic/druid';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  MappedEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 65;
const TRANQ_CHANNEL_BUFFER_MS = 10_000;

export const APPLIED_HEAL = 'AppliedHeal';
export const FROM_HARDCAST = 'FromHardcast';
export const FROM_EXPIRING_LIFEBLOOM = 'FromExpiringLifebloom';
export const CAUSED_BLOOM = 'CausedBloom';
export const CAUSED_TICK = 'CausedTick';
export const REGEN_FROM_LIFEBLOOM = 'RegenFromLifebloom';
export const CAUSED_REGEN = 'CausedRegen';
export const FROM_CLEARCAST = 'FromClearcast';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.REJUVENATION.id],
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
    linkingEventId: [SPELLS.LIFEBLOOM.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.LIFEBLOOM.id,
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
    linkRelation: FROM_EXPIRING_LIFEBLOOM,
    reverseLinkRelation: CAUSED_BLOOM,
    linkingEventId: SPELLS.LIFEBLOOM_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.LIFEBLOOM.id],
    referencedEventType: [EventType.RefreshBuff, EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: CAUSED_TICK,
    linkingEventId: SPELLS.TRANQUILITY.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TRANQUILITY.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: TRANQ_CHANNEL_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: CAUSED_REGEN,
    reverseLinkRelation: REGEN_FROM_LIFEBLOOM,
    linkingEventId: SPELLS.LIFEBLOOM.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.LIFEBLOOM_REGEN.id,
    referencedEventType: EventType.ResourceChange,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_CLEARCAST,
    linkingEventId: SPELLS.CLEARCASTING.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [
      SPELLS.REGROWTH.id,
      SPELLS.REJUVENATION.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.SWIFTMEND.id,
      SPELLS.LIFEBLOOM.id,
      SPELLS.TRANQUILITY.id,
      SPELLS.NOURISH.id,
      SPELLS.HEALING_TOUCH.id,
    ],
    referencedEventType: EventType.Cast,
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

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

/** Returns the hardcast event that caused this buff or heal, if there is one */
export function getHardcast(event: AbilityEvent<any>): CastEvent | undefined {
  return GetRelatedEvents(event, FROM_HARDCAST)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .pop();
}

/** Returns the buff application and direct heal events caused by the given hardcast */
export function getHeals(event: CastEvent): MappedEvent[] {
  return GetRelatedEvents(event, APPLIED_HEAL);
}

/** Returns the direct heal event caused by this hardcast, if there is one */
export function getDirectHeal(event: CastEvent): HealEvent | undefined {
  return getHeals(event)
    .filter((e): e is HealEvent => e.type === EventType.Heal)
    .pop();
}

/** Returns true iff the given bloom heal can be linked to the refresh or removal of a lifebloom
 *  buff - used to differentiate from a Photosynthesis proc */
export function isFromExpiringLifebloom(event: HealEvent): boolean {
  return HasRelatedEvent(event, FROM_EXPIRING_LIFEBLOOM);
}

/** Returns true iff the bloom expiration caused a bloom to proc */
export function causedBloom(event: RemoveBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, CAUSED_BLOOM);
}

/** Gets the tranquility "tick cast" events caused by channeling the given Tranquility w/
 *  cast ID `TRANQUILITY_CAST`. */
export function getTranquilityTicks(event: CastEvent): MappedEvent[] {
  return GetRelatedEvents(event, CAUSED_TICK);
}

export function getBloomCausingRegen(event: ResourceChangeEvent): RemoveBuffEvent | undefined {
  return GetRelatedEvents(event, REGEN_FROM_LIFEBLOOM)
    .filter((e): e is RemoveBuffEvent => e.type === EventType.RemoveBuff)
    .pop();
}

export function getClearcastConsumer(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvents(event, FROM_CLEARCAST)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .pop();
}

export default CastLinkNormalizer;
