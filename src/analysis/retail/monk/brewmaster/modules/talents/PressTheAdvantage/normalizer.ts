import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';

export const PTA_TRIGGER_BUFF = 'pta-trigger-buff';
export const PTA_TRIGGER_CAST = 'pta-trigger-cast';
export const PTA_BONUS_CAST = 'pta-bonus-cast';
export const PTA_BUFF = 'pta-buff';
export const KS_DAMAGE = 'ks-damage';
export const KS_CAST = 'ks-cast';
export const RSK_CAST = 'rsk-cast';
export const RSK_DAMAGE = 'rsk-damage';

const LINKS: EventLink[] = [
  {
    linkRelation: PTA_BONUS_CAST,
    reverseLinkRelation: PTA_BUFF,
    linkingEventId: SPELLS.PRESS_THE_ADVANTAGE_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    // tight buffer because of potential false positives
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    // pta casts the damage spells
    referencedEventId: [SPELLS.RISING_SUN_KICK_DAMAGE.id, talents.KEG_SMASH_TALENT.id],
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    anyTarget: true,
  },
  {
    linkRelation: PTA_TRIGGER_CAST,
    reverseLinkRelation: PTA_TRIGGER_BUFF,
    linkingEventId: SPELLS.PRESS_THE_ADVANTAGE_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    backwardBufferMs: 2000,
    referencedEventId: [talents.RISING_SUN_KICK_TALENT.id, talents.KEG_SMASH_TALENT.id],
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    anyTarget: true,
    additionalCondition: (_linkingEvent, referencedEvent) =>
      GetRelatedEvents(referencedEvent, PTA_BUFF).length === 0,
  },
  {
    linkRelation: KS_CAST,
    reverseLinkRelation: KS_DAMAGE,
    linkingEventId: talents.KEG_SMASH_TALENT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: talents.KEG_SMASH_TALENT.id,
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    // keg smash has a potentially quite long travel time
    backwardBufferMs: 2000,
  },
  {
    linkRelation: RSK_CAST,
    reverseLinkRelation: RSK_DAMAGE,
    linkingEventId: SPELLS.RISING_SUN_KICK_DAMAGE.id,
    linkingEventType: EventType.Damage,
    backwardBufferMs: 100,
    referencedEventId: [SPELLS.RISING_SUN_KICK_DAMAGE.id, talents.RISING_SUN_KICK_TALENT.id],
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
  },
];

export function isPtaBonusCast(event: CastEvent): boolean {
  return GetRelatedEvents(event, PTA_BUFF).length > 0;
}

export function ptaBonusCast(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvent(event, PTA_BONUS_CAST);
}

export function ptaBonusDamage(event: RemoveBuffEvent): DamageEvent[] {
  const cast = ptaBonusCast(event);

  if (!cast) {
    return [];
  }

  return GetRelatedEvents<DamageEvent>(cast, RSK_DAMAGE).concat(GetRelatedEvents(cast, KS_DAMAGE));
}

export default class PressTheAdvantageNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);

    for (const event of events) {
      if (event.type === EventType.Cast && isPtaBonusCast(event)) {
        (event as AnyEvent).type = EventType.FreeCast;
        event.__modified = true;
      }
    }
    return events;
  }
}
