import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  AnyEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 200;
const AFTER_CAST_BUFFER_MS = 300; // parries can be delayed even more...

const FROM_HARDCAST = 'FromHardcast';
const FROM_DOUBLE_CLAWED_RAKE = 'FromDoubleClawedRake';
const FROM_PRIMAL_WRATH = 'FromPrimalWrath';
const HIT_TARGET = 'HitTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.RIP.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.RIP.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_PRIMAL_WRATH,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.RIP.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: TALENTS_DRUID.PRIMAL_WRATH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT),
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: [SPELLS.RAKE_BLEED.id, SPELLS.RAKE_STUN.id],
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.RAKE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_DOUBLE_CLAWED_RAKE,
    linkingEventId: [SPELLS.RAKE_BLEED.id, SPELLS.RAKE_STUN.id],
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.RAKE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
    anyTarget: true,
    additionalCondition: (le, re) => !isFromHardcast(le),
    isActive: (c) => c.hasTalent(TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT),
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.RAKE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.RAKE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.MOONFIRE_FERAL.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.MOONFIRE_FERAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.FEROCIOUS_BITE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.FEROCIOUS_BITE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.RAVAGE_DOTC_CAT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.RAVAGE_DOTC_CAT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.RAVAGE_TALENT),
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.SHRED.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.SHRED.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: TALENTS_DRUID.BRUTAL_SLASH_TALENT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS_DRUID.BRUTAL_SLASH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT),
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.SWIPE_CAT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.SWIPE_CAT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.THRASH_FERAL_BLEED.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.THRASH_FERAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * When a DoT spell is cast on a target, the ordering of the Cast and ApplyDebuff/RefreshDebuff/(direct)Damage
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyDebuff/RefreshDebuff/Damage linking back to the Cast event
 * that caused it (if one can be found).
 *
 * Also adds a 'hit target' link from Cast events that AoE, allowing an easy count of number of hits.
 *
 * This normalizer adds links for the debuffs Rip, Rake, Moonfire,
 * and for the direct damage of Rake and Ferocious Bite.
 * A special link key is used when the Rips were applied by a Primal Wrath cast instead of a normal hardcast.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromHardcast(event: AnyEvent): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function isFromDoubleClawedRake(event: AnyEvent): boolean {
  return HasRelatedEvent(event, FROM_DOUBLE_CLAWED_RAKE);
}

export function getHardcast(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): CastEvent | undefined {
  return GetRelatedEvent(event, FROM_HARDCAST);
}

export function getPrimalWrath(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): CastEvent | undefined {
  return GetRelatedEvent(event, FROM_PRIMAL_WRATH);
}

/** Only works for the AoE casts Primal Wrath, Brutal Slash, Swipe, and (Cat) Thrash */
export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, HIT_TARGET).length;
}

export function getHits(castEvent: CastEvent): AbilityEvent<any>[] {
  return GetRelatedEvents(castEvent, HIT_TARGET, HasAbility);
}

export function getDamageHits(castEvent: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    castEvent,
    HIT_TARGET,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export default CastLinkNormalizer;
