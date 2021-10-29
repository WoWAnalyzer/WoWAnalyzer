import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AnyEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 200;

export const FROM_HARDCAST = 'FromHardcast';
export const FROM_PRIMAL_WRATH = 'FromPrimalWrath';
export const HIT_TARGET = 'HitTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
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
    referencedEventId: SPELLS.PRIMAL_WRATH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: [SPELLS.RAKE_BLEED.id, SPELLS.RAKE_STUN.id],
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.RAKE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.RAKE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.RAKE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
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
    linkingEventId: SPELLS.FEROCIOUS_BITE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.FEROCIOUS_BITE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.BRUTAL_SLASH_TALENT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.BRUTAL_SLASH_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.SWIPE_CAT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.SWIPE_CAT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.THRASH_FERAL.id,
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

export function isFromHardcast(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function getHardcast(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): CastEvent | undefined {
  const events: AnyEvent[] = GetRelatedEvents(event, FROM_HARDCAST);
  return events.length === 0 ? undefined : (events[0] as CastEvent);
}

// TODO get hardcast energy / cp?

export function isFromPrimalWrath(event: ApplyDebuffEvent | RefreshDebuffEvent): boolean {
  return HasRelatedEvent(event, FROM_PRIMAL_WRATH);
}

export function getPrimalWrath(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): CastEvent | undefined {
  const events: AnyEvent[] = GetRelatedEvents(event, FROM_PRIMAL_WRATH);
  return events.length === 0 ? undefined : (events[0] as CastEvent);
}

/** Only works for the AoE casts Primal Wrath, Brutal Slash, Swipe, and (Cat) Thrash */
export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, HIT_TARGET).length;
}

export default CastLinkNormalizer;
