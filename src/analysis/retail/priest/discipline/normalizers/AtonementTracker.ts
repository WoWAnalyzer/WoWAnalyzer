import {
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { ATONEMENT_DAMAGE_IDS } from '../constants';

const BUFFER_MS = 200;
const ATONEMENT_DAMAGE_EVENT = 'AtonementDamageEvent';
const ATONEMENT_HEAL_EVENT = 'AtonementHealEvent';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ATONEMENT_HEAL_EVENT,
    reverseLinkRelation: ATONEMENT_DAMAGE_EVENT,
    linkingEventId: ATONEMENT_DAMAGE_IDS,
    linkingEventType: EventType.Damage,
    referencedEventId: [SPELLS.ATONEMENT_HEAL_CRIT.id, SPELLS.ATONEMENT_HEAL_NON_CRIT.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },
];

class AtonementNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function hasAtonementDamageEvent(event: HealEvent): boolean {
  return HasRelatedEvent(event, ATONEMENT_DAMAGE_EVENT);
}

export function getDamageEvent(event: HealEvent) {
  return GetRelatedEvents(event, ATONEMENT_DAMAGE_EVENT)[0] as DamageEvent;
}

export default AtonementNormalizer;
