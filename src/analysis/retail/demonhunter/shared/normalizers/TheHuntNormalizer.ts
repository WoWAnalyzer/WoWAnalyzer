import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const THE_HUNT_CHARGE_BUFFER = 4000;
const THE_HUNT_DOT_BUFFER = 4000;
const THE_HUNT_DAMAGE_BUFFER = 11000;

const THE_HUNT_CHARGE = 'TheHuntCharge';
const THE_HUNT_DOT_APPLICATION = 'TheHuntDots';
const THE_HUNT_DAMAGE = 'TheHuntDamage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: THE_HUNT_CHARGE,
    referencedEventId: SPELLS.THE_HUNT_CHARGE.id,
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS.THE_HUNT_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: THE_HUNT_CHARGE_BUFFER,
    backwardBufferMs: THE_HUNT_CHARGE_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: THE_HUNT_DOT_APPLICATION,
    referencedEventId: SPELLS.THE_HUNT_DOT.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: TALENTS.THE_HUNT_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: THE_HUNT_DOT_BUFFER,
    backwardBufferMs: THE_HUNT_DOT_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: THE_HUNT_DAMAGE,
    referencedEventId: [SPELLS.THE_HUNT_CHARGE.id, SPELLS.THE_HUNT_DOT.id],
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS.THE_HUNT_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: THE_HUNT_DAMAGE_BUFFER,
    backwardBufferMs: THE_HUNT_DAMAGE_BUFFER,
    anyTarget: true,
  },
];

export default class TheHuntVengefulRetreatNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getChargeImpact(event: CastEvent): DamageEvent | undefined {
  return GetRelatedEvents<DamageEvent>(
    event,
    THE_HUNT_CHARGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  ).find(Boolean);
}

export function getDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    THE_HUNT_CHARGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getAppliedDots(event: CastEvent): ApplyDebuffEvent[] {
  return GetRelatedEvents(
    event,
    THE_HUNT_CHARGE,
    (e): e is ApplyDebuffEvent => e.type === EventType.ApplyDebuff,
  );
}
