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
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const CAST_BUFFER_MS = 150;
const TRANQ_CHANNEL_BUFFER_MS = 10_000;

const APPLIED_HEAL = 'AppliedHeal';
const FROM_HARDCAST = 'FromHardcast';
const FROM_OVERGROWTH = 'FromOvergrowth';
const FROM_EXPIRING_LIFEBLOOM = 'FromExpiringLifebloom';
const CAUSED_BLOOM = 'CausedBloom';
const CAUSED_TICK = 'CausedTick';
const CAUSED_SUMMON = 'CausedSummon';

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
    linkingEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id],
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
    linkingEventId: TALENTS_DRUID.FLOURISH_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_DRUID.FLOURISH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    // for discerning hardcasts from reforestation procs
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.INCARNATION_TOL_ALLOWED.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    // for discerning hardcast and CG summons
    linkRelation: CAUSED_SUMMON,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: TALENTS_DRUID.GROVE_GUARDIANS_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_DRUID.GROVE_GUARDIANS_TALENT.id,
    referencedEventType: EventType.Summon,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true, // the summon event 'targets' the summon, while cast targets a player
    maximumLinks: 1,
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
      SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_DRUID.OVERGROWTH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_EXPIRING_LIFEBLOOM,
    reverseLinkRelation: CAUSED_BLOOM,
    linkingEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id],
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

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

/** Returns the hardcast event that caused this buff or heal, if there is one */
export function getHardcast(event: AbilityEvent<any>): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    FROM_HARDCAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

/** Returns true iff the given buff application can be matched to an Overgrowth cast */
export function isFromOvergrowth(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_OVERGROWTH);
}

/** Returns the buff application and direct heal events caused by the given hardcast */
export function getHeals(event: CastEvent): AnyEvent[] {
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
export function getTranquilityTicks(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, CAUSED_TICK);
}

export default CastLinkNormalizer;
