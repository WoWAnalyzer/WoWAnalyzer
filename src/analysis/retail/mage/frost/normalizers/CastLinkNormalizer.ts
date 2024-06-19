import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, DamageEvent, EventType, HasRelatedEvent, HasTarget } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const CAST_BUFFER_MS = 75;

const BUFF_APPLY = 'BuffApply';
const BUFF_REMOVE = 'BuffRemove';
const BUFF_REFRESH = 'BuffRefresh';
const DEBUFF_APPLY = 'DebuffApply';
const DEBUFF_REMOVE = 'DebuffRemove';
const SPELL_CAST = 'SpellCast';
const PRE_CAST = 'PreCast';
const SPELL_DAMAGE = 'SpellDamage';
const CLEAVE_DAMAGE = 'CleaveDamage';

const EVENT_LINKS: EventLink[] = [
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.FROSTBOLT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.FROSTBOLT_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.GLACIAL_SPIKE_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.GLACIAL_SPIKE_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return isCleaveDamage(linkingEvent as CastEvent, referencedEvent as DamageEvent) === false;
    },
    maximumLinks: 1,
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.GLACIAL_SPIKE_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: CLEAVE_DAMAGE,
    referencedEventId: SPELLS.GLACIAL_SPIKE_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return isCleaveDamage(linkingEvent as CastEvent, referencedEvent as DamageEvent) === true;
    },
    maximumLinks: 1,
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.FLURRY_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.FLURRY_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 1500,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.ICE_LANCE_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.ICE_LANCE_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return isCleaveDamage(linkingEvent as CastEvent, referencedEvent as DamageEvent) === false;
    },
    maximumLinks: 1,
    forwardBufferMs: 1000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.ICE_LANCE_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: CLEAVE_DAMAGE,
    referencedEventId: SPELLS.ICE_LANCE_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return isCleaveDamage(linkingEvent as CastEvent, referencedEvent as DamageEvent) === true;
    },
    maximumLinks: 1,
    forwardBufferMs: 1000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.BRAIN_FREEZE_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.BRAIN_FREEZE_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 17_000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.BRAIN_FREEZE_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.FLURRY_TALENT.id,
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: DEBUFF_APPLY,
    linkingEventId: SPELLS.WINTERS_CHILL.id,
    linkingEventType: EventType.ApplyDebuff,
    linkRelation: DEBUFF_REMOVE,
    referencedEventId: SPELLS.WINTERS_CHILL.id,
    referencedEventType: EventType.RemoveDebuff,
    maximumLinks: 1,
    forwardBufferMs: 7000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: DEBUFF_APPLY,
    linkingEventId: SPELLS.WINTERS_CHILL.id,
    linkingEventType: EventType.ApplyDebuff,
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.FLURRY_TALENT.id,
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 1000,
  },
  {
    reverseLinkRelation: DEBUFF_APPLY,
    linkingEventId: SPELLS.WINTERS_CHILL.id,
    linkingEventType: EventType.ApplyDebuff,
    linkRelation: PRE_CAST,
    referencedEventId: [SPELLS.FROSTBOLT.id, TALENTS.GLACIAL_SPIKE_TALENT.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 1000,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    linkRelation: BUFF_REMOVE,
    referencedEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return !HasRelatedEvent(referencedEvent, BUFF_APPLY);
    },
    maximumLinks: 1,
    forwardBufferMs: 18_000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    linkRelation: BUFF_REFRESH,
    referencedEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    referencedEventType: EventType.RefreshBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.ICE_LANCE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent): boolean {
      return !HasRelatedEvent(referencedEvent, BUFF_REMOVE);
    },
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.FINGERS_OF_FROST_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_CAST,
    referencedEventId: TALENTS.ICE_LANCE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  /**
   * Relation: Icy Veins Remove Buff <=> Icy Veins Spell Cast (60s before remove)
   */
  {
    linkRelation: BUFF_REMOVE,
    linkingEventId: TALENTS.ICY_VEINS_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.ICY_VEINS_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    reverseLinkRelation: SPELL_CAST,
    anyTarget: true,
    forwardBufferMs: 60_000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: TALENTS.ICY_VEINS_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: TALENTS.ICY_VEINS_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 60_000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_APPLY,
    linkingEventId: TALENTS.COLD_FRONT_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    linkRelation: BUFF_REMOVE,
    referencedEventId: TALENTS.COLD_FRONT_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 500,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.COMET_STORM_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.COMET_STORM_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 3000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.RAY_OF_FROST_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: TALENTS.RAY_OF_FROST_TALENT.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 7000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: BUFF_REMOVE,
    linkingEventId: SPELLS.EXCESS_FROST_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: TALENTS.FLURRY_TALENT.id,
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

function isCleaveDamage(castEvent: CastEvent, damageEvent: DamageEvent): boolean {
  const castTarget =
    HasTarget(castEvent) && encodeTargetString(castEvent.targetID, castEvent.targetInstance);
  const damageTarget =
    HasTarget(damageEvent) && encodeTargetString(damageEvent.targetID, damageEvent.targetInstance);
  return castTarget !== damageTarget;
}

export default CastLinkNormalizer;
