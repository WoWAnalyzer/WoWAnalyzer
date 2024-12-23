import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import { DEMONSURGE_TRIGGERS } from 'analysis/retail/demonhunter/shared';

const DEMONSURGE_BUFFER = 600;
const DEMONSURGE_DAMAGE = 'DemonsurgeDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: DEMONSURGE_DAMAGE,
    referencedEventId: SPELLS.DEMONSURGE.id,
    referencedEventType: EventType.Damage,
    linkingEventId: [
      ...DEMONSURGE_TRIGGERS.HAVOC.DEMONIC,
      ...DEMONSURGE_TRIGGERS.HAVOC.HARDCAST_ADDL,
      ...DEMONSURGE_TRIGGERS.VENGEANCE.DEMONIC,
      ...DEMONSURGE_TRIGGERS.VENGEANCE.HARDCAST_ADDL,
    ].map((it) => it.id),
    linkingEventType: EventType.Cast,
    forwardBufferMs: DEMONSURGE_BUFFER,
    anyTarget: true,
  },
];

export default class DemonsurgeEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    DEMONSURGE_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
