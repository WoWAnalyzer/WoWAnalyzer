import SPELLS from 'common/SPELLS';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';

// Base channel time is 3s, reduced by haste
const DAMAGE_BUFFER = 3200;

const VOID_RAY_DAMAGE = 'VoidRayDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VOID_RAY_DAMAGE,
    referencedEventId: [SPELLS.VOID_RAY_DAMAGE.id, SPELLS.VOID_RAY_DAMAGE_META.id],
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS_DEMON_HUNTER.VOID_RAY_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: DAMAGE_BUFFER,
    anyTarget: true,
  },
];

export default class VoidRayEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getVoidRayDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    VOID_RAY_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
