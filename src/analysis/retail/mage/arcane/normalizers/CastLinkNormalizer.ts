import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 75;

const SPELL_CAST = 'SpellCast';
const SPELL_DAMAGE = 'SpellDamage';
const DEBUFF_APPLY = 'DebuffApply';
const DEBUFF_REMOVE = 'DebuffRemove';

const EVENT_LINKS: EventLink[] = [
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.ARCANE_EXPLOSION.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.ARCANE_EXPLOSION.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.ARCANE_BARRAGE.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.ARCANE_BARRAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 1500,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: SPELLS.ARCANE_ORB.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: SPELLS.ARCANE_ORB_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: 1500,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.ARCANE_SURGE_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: SPELL_DAMAGE,
    referencedEventId: TALENTS.ARCANE_SURGE_TALENT.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: DEBUFF_APPLY,
    referencedEventId: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    maximumLinks: 1,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    reverseLinkRelation: SPELL_CAST,
    linkingEventId: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
    linkingEventType: EventType.Cast,
    linkRelation: DEBUFF_REMOVE,
    referencedEventId: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
    referencedEventType: EventType.RemoveDebuff,
    maximumLinks: 1,
    anyTarget: true,
    forwardBufferMs: 14000,
    backwardBufferMs: CAST_BUFFER_MS,
  },
];

/**
 *Links the damage events for spells to their cast event. This allows for more easily accessing the related events in spec modules instead of looking at the events separately.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, SPELL_DAMAGE).length;
}

export default CastLinkNormalizer;
