import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
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
const AFTER_CAST_BUFFER_MS = 1000; // Bomb has a long travel time

const FROM_HARDCAST = 'FromHardcast';
const HIT_TARGET = 'HitTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.WILDFIRE_BOMB_IMPACT.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: TALENTS.WILDFIRE_BOMB_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: AFTER_CAST_BUFFER_MS,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromHardcast(event: AnyEvent): boolean {
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
