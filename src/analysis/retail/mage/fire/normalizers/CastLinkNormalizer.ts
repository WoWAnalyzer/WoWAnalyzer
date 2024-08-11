import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  BeginCastEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasTarget,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const CAST_BUFFER_MS = 75;
const EXTENDED_CAST_BUFFER_MS = 150;

const BUFF_APPLY = 'BuffApply';
const BUFF_REMOVE = 'BuffRemove';
const CAST_BEGIN = 'CastBegin';
const SPELL_CAST = 'SpellCast';
const PRE_CAST = 'PreCast';
const SPELL_DAMAGE = 'SpellDamage';

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
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.COMBUSTION_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: BUFF_APPLY,
    referencedEventId: TALENTS.COMBUSTION_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 7_000, //Needed for an edge case where SKB Combust was active and was refreshed by a Combust cast
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
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.METEOR_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.METEOR_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 2000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.EXCESS_FROST_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: TALENTS.PHOENIX_FLAMES_TALENT.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
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

function isInstantCast(event: CastEvent): boolean {
  const beginCast = GetRelatedEvents<BeginCastEvent>(event, CAST_BEGIN)[0];
  return !beginCast || event.timestamp - beginCast.timestamp <= CAST_BUFFER_MS;
}

export default CastLinkNormalizer;
