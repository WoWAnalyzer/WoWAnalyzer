import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS/demonhunter';

const DAMAGE_BUFFER = 2500;

const SIGIL_OF_FLAME_DAMAGE = 'SigilOfFlameDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SIGIL_OF_FLAME_DAMAGE,
    referencedEventId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
    referencedEventType: EventType.Damage,
    linkingEventId: [SPELLS.SIGIL_OF_FLAME.id, SPELLS.SIGIL_OF_FLAME_PRECISE.id],
    linkingEventType: EventType.Cast,
    forwardBufferMs: DAMAGE_BUFFER,
    backwardBufferMs: DAMAGE_BUFFER,
    anyTarget: true,
  },
];

export default class SigilOfFlameNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSigilOfFlameDamages(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    SIGIL_OF_FLAME_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
