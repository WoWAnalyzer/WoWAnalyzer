import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS/demonhunter';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/demonhunter';
import { Options } from 'parser/core/Module';

const FEL_DEVASTATION_DAMAGE_BUFFER = 3000;

const FEL_DEVASTATION_DAMAGE = 'FelDevastationDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FEL_DEVASTATION_DAMAGE,
    referencedEventId: SPELLS.FEL_DEVASTATION_DAMAGE.id,
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS.FEL_DEVASTATION_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: FEL_DEVASTATION_DAMAGE_BUFFER,
    backwardBufferMs: FEL_DEVASTATION_DAMAGE_BUFFER,
    anyTarget: true,
  },
];

export default class FelDevastationLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    FEL_DEVASTATION_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
