import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  BeginCastEvent,
  RemoveBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HasTarget,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const CAST_BUFFER_MS = 75;
const EXTENDED_CAST_BUFFER_MS = 150;

export const BUFF_APPLY = 'BuffApply';
export const BUFF_REMOVE = 'BuffRemove';
export const BUFF_REFRESH = 'BuffRefresh';
export const CAST_BEGIN = 'CastBegin';
export const SPELL_CAST = 'SpellCast';
export const PRE_CAST = 'PreCast';
export const SPELL_DAMAGE = 'SpellDamage';
export const EXPLODE_DEBUFF = 'ExplosionDebuff';

const EVENT_LINKS: EventLink[] = [
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: TALENTS.COMBUSTION_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: TALENTS.COMBUSTION_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 60_000, //Combustion can be extended multiple times, so 60s to be safe
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
    forwardBufferMs: 16_000, //15sec duration, plus a buffer
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.FLAMES_FURY.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FLAMES_FURY.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 32_000, //30sec duration, plus a buffer
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.FURY_OF_THE_SUN_KING.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FURY_OF_THE_SUN_KING.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 32_000, //30sec duration, plus a buffer
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.HOT_STREAK.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_CAST,
    referencedEventId: [TALENTS.PYROBLAST_TALENT.id, SPELLS.FLAMESTRIKE.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: EXTENDED_CAST_BUFFER_MS,
    backwardBufferMs: EXTENDED_CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.FLAMES_FURY.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.PHOENIX_FLAMES_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 2000,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 600_000, //If you manage your charges, you can keep the buff up pretty much the whole fight, so 10min just in case.
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
    backwardBufferMs: 600_000, //If you manage your charges, you can keep the buff up pretty much the whole fight, so 10min just in case.
  },
  {
    linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    linkingEventType: EventType.ApplyBuffStack,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 600_000, //If you manage your charges, you can keep the buff up pretty much the whole fight, so 10min just in case.
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkingEventId: TALENTS.LIVING_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: EXPLODE_DEBUFF,
    referencedEventId: SPELLS.LIVING_BOMB_EXPLODE_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    forwardBufferMs: 7_000,
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
    forwardBufferMs: 8000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: CAST_BEGIN,
    linkingEventId: SPELLS.FIREBALL.id,
    linkingEventType: EventType.BeginCast,
    linkRelation: SPELL_CAST,
    referencedEventId: SPELLS.FIREBALL.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: CAST_BEGIN,
    linkingEventId: SPELLS.SCORCH.id,
    linkingEventType: EventType.BeginCast,
    linkRelation: SPELL_CAST,
    referencedEventId: SPELLS.SCORCH.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 2000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: CAST_BEGIN,
    linkingEventId: SPELLS.FLAMESTRIKE.id,
    linkingEventType: EventType.BeginCast,
    linkRelation: SPELL_CAST,
    referencedEventId: SPELLS.FLAMESTRIKE.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 4000,
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
    forwardBufferMs: 8000, //4sec cast, adding some extra just in case casting is slowed
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.PHOENIX_FLAMES_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.PHOENIX_FLAMES_DAMAGE.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      if (!linkingEvent || !referencedEvent) {
        return false;
      }
      const castTarget =
        HasTarget(linkingEvent) &&
        encodeTargetString(linkingEvent.targetID, linkingEvent.targetInstance);
      const damageTarget =
        HasTarget(referencedEvent) &&
        encodeTargetString(referencedEvent.targetID, referencedEvent.targetInstance);
      return castTarget === damageTarget;
    },
    forwardBufferMs: 1000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.FIREBALL.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.FIREBALL.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    forwardBufferMs: 1000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.SCORCH.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.SCORCH.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.FIRE_BLAST.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.FIRE_BLAST.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.COMBUSTION_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: PRE_CAST,
    referencedEventId: [
      SPELLS.FIREBALL.id,
      TALENTS.PYROBLAST_TALENT.id,
      SPELLS.SCORCH.id,
      SPELLS.FLAMESTRIKE.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return !isInstantCast(referencedEvent as CastEvent);
    },
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.HOT_STREAK.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: PRE_CAST,
    referencedEventId: [TALENTS.PYROBLAST_TALENT.id, SPELLS.FIREBALL.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      if ((referencedEvent as CastEvent).ability.guid === TALENTS.PYROBLAST_TALENT.id) {
        return !isInstantCast(referencedEvent as CastEvent);
      } else {
        return true;
      }
    },
    forwardBufferMs: CAST_BUFFER_MS,
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
  return !beginCast || event.timestamp - beginCast.timestamp <= CAST_BUFFER_MS;
}

export function hasPreCast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, PRE_CAST);
}

/** Returns the hardcast event that caused this buff or heal, if there is one */
export function getHardcast(event: AbilityEvent<any>): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    SPELL_CAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

export function isProcExpired(event: RemoveBuffEvent, spenderId: number): boolean {
  const cast = GetRelatedEvents<CastEvent>(event, SPELL_CAST)[0];
  return !cast || cast.ability.guid !== spenderId;
}

export default CastLinkNormalizer;
