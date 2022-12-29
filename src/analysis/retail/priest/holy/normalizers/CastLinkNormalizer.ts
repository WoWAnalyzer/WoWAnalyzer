import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

const CAST_BUFFER_MS = 100;

export const FROM_HARDCAST = 'FromHardcast'; // for linking a heal to its cast
export const LIGHTWEAVER_APPLY = 'LightweaverApplication'; // link flash heal cast to applying the lightweaver buff
export const LIGHTWEAVER_CONSUME = 'LightweaverConumption'; // link heal cast to removing the lightweaver buff
export const POH_CAST = 'PrayerOfHealingCast';
export const COH_CAST = 'CircleOfHealingCast';

const EVENT_LINKS: EventLink[] = [
  // Link single target heal casts to their heal events.
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: [SPELLS.GREATER_HEAL.id, SPELLS.FLASH_HEAL.id],
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.GREATER_HEAL.id, SPELLS.FLASH_HEAL.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // Link prayer of healing casts to their multiple heal events.
  {
    linkRelation: POH_CAST,
    reverseLinkRelation: POH_CAST,
    linkingEventId: TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // Link circle of healing casts to their multiple heal events.
  {
    linkRelation: COH_CAST,
    reverseLinkRelation: COH_CAST,
    linkingEventId: TALENTS_PRIEST.CIRCLE_OF_HEALING_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.CIRCLE_OF_HEALING_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // Link Lightweaver remove buff to heal event.
  {
    linkRelation: LIGHTWEAVER_CONSUME,
    reverseLinkRelation: LIGHTWEAVER_CONSUME,
    linkingEventId: SPELLS.GREATER_HEAL.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.LIGHTWEAVER_TALENT_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_PRIEST.LIGHTWEAVER_TALENT);
    },
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrayerOfHealingEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, POH_CAST).filter((e): e is HealEvent => e.type === EventType.Heal);
}

export function getCircleOfHealingEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, COH_CAST).filter((e): e is HealEvent => e.type === EventType.Heal);
}

export function getHeal(event: CastEvent): HealEvent | undefined {
  return GetRelatedEvents(event, FROM_HARDCAST)
    .filter((e): e is HealEvent => e.type === EventType.Heal)
    .pop();
}

export function isCastBuffedByLightweaver(event: CastEvent) {
  return HasRelatedEvent(event, LIGHTWEAVER_CONSUME);
}

export default CastLinkNormalizer;
