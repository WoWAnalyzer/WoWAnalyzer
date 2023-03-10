import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  AbilityEvent,
  AnyEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';

const CAST_BUFFER_MS = 400;

export const FROM_HARDCAST = 'FromHardcast';
export const HIT_TARGET = 'HitTarget';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.BETWEEN_THE_EYES.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.BETWEEN_THE_EYES.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
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
 */
export default class CastLinkNormalizer extends EventLinkNormalizer {
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
  const events: AnyEvent[] = GetRelatedEvents(event, FROM_HARDCAST);
  return events.length === 0 ? undefined : (events[0] as CastEvent);
}

export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, HIT_TARGET).length;
}

export function getHits(castEvent: CastEvent): AbilityEvent<any>[] {
  return GetRelatedEvents(castEvent, HIT_TARGET).filter((e): e is AbilityEvent<any> =>
    HasAbility(e),
  );
}
