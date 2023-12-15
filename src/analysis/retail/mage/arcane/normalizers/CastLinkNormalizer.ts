import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const FORWARD_BUFFER_MS = 25;
const CAST_BUFFER_MS = 500;

export const FROM_HARDCAST = 'FromHardcast';
export const FROM_PRIMAL_WRATH = 'FromPrimalWrath';
export const HIT_TARGET = 'HitTarget';
export const SPELL_CAST = 'SpellCast';
export const SPELL_DAMAGE = 'SpellDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.ARCANE_EXPLOSION.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.ARCANE_EXPLOSION.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: FORWARD_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    reverseLinkRelation: HIT_TARGET,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.ARCANE_BARRAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.ARCANE_BARRAGE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: FORWARD_BUFFER_MS,
    backwardBufferMs: 1500,
    anyTarget: true,
    reverseLinkRelation: HIT_TARGET,
  },
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.ARCANE_ORB_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS.ARCANE_ORB_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: FORWARD_BUFFER_MS,
    backwardBufferMs: 1500,
    anyTarget: true,
    reverseLinkRelation: HIT_TARGET,
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
];

/**
 *Links the damage events for spells to their cast event. This allows for more easily accessing the related events in spec modules instead of looking at the events separately.
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
  return GetRelatedEvent(event, FROM_HARDCAST);
}

export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, HIT_TARGET).length;
}

export default CastLinkNormalizer;
