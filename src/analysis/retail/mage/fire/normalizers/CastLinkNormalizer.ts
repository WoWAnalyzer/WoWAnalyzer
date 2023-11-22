import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  AnyEvent,
  BeginCastEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 50;
const COMBUSTION_BUFFER_MS = 60_000; //Combustion can be extended multiple times, so 60s to be safe
const HOT_STREAK_BUFFER_MS = 15_500; //15s Buff Duration + Buffer
const FEEL_THE_BURN_BUFFER_MS = 600_000; //Feel the Burn can potentially be continually extended for the entire fight, so 10m to be safe
const PYROBLAST_BUFFER_MS = 8_000; //4s Cast + extra in cast spell casting is slowed

export const BUFF_APPLY = 'BuffApply';
export const BUFF_REMOVE = 'BuffRemove';
export const BUFF_REFRESH = 'BuffRefresh';
export const CAST_BEGIN = 'CastBegin';
export const SPELL_CAST = 'SpellCast';
export const SPELL_DAMAGE = 'SpellDamage';

const EVENT_LINKS: EventLink[] = [
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.COMBUSTION_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: BUFF_APPLY,
    referencedEventId: TALENTS.COMBUSTION_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: TALENTS.COMBUSTION_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: TALENTS.COMBUSTION_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: COMBUSTION_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.HOT_STREAK.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.HOT_STREAK.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: HOT_STREAK_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: FEEL_THE_BURN_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    linkingEventType: EventType.ApplyBuffStack,
    linkRelation: BUFF_APPLY,
    referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    referencedEventType: EventType.ApplyBuff,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: FEEL_THE_BURN_BUFFER_MS,
  },
  {
    linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    linkingEventType: EventType.ApplyBuffStack,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: FEEL_THE_BURN_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: CAST_BEGIN,
    linkingEventId: TALENTS.PYROBLAST_TALENT.id,
    linkingEventType: EventType.BeginCast,
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.PYROBLAST_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: PYROBLAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.PYROBLAST_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: TALENTS.PYROBLAST_TALENT.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    forwardBufferMs: PYROBLAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
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
  return HasRelatedEvent(event, SPELL_CAST);
}

export function isInstantCast(event: CastEvent): boolean {
  const beginCast = GetRelatedEvents<BeginCastEvent>(event, CAST_BEGIN)[0];
  return event.timestamp - beginCast.timestamp <= CAST_BUFFER_MS;
}

/** Returns the hardcast event that caused this buff or heal, if there is one */
export function getHardcast(event: AbilityEvent<any>): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    SPELL_CAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

/** Returns the buff application and direct heal events caused by the given hardcast */
export function getHeals(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, BUFF_APPLY);
}

/** Returns the direct heal event caused by this hardcast, if there is one */
export function getDirectHeal(event: CastEvent): HealEvent | undefined {
  return getHeals(event)
    .filter((e): e is HealEvent => e.type === EventType.Heal)
    .pop();
}

export default CastLinkNormalizer;
