import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

const CAST_BUFFER_MS = 200;

export const FROM_HARDCAST = 'FromHardcast'; // for linking a heal to its cast
export const LIGHTWEAVER_APPLY = 'LightweaverApplication'; // link flash heal cast to applying the lightweaver buff
export const LIGHTWEAVER_CONSUME = 'LightweaverConsumption'; // link heal cast to removing the lightweaver buff
export const POH_CAST = 'PrayerOfHealingCast';
export const COH_CAST = 'CircleOfHealingCast';
export const SERENITY_CAST = 'HolyWordSerenityCast';
export const SANCTIFY_CAST = 'HolyWordSanctifyCast';
export const SALVATION_CAST = 'HolyWordSalvationCast';
export const CHASTISE_CAST = 'HolyWordChastiseCast';
export const LIGHTWELL_RENEW_HEALS = 'LightwellRenewHeal';
export const SALVATION_RENEW_HEALS = 'SalvationRenewHeal';

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
  // Link Holy Word Serenity casts to heal event
  {
    linkRelation: SERENITY_CAST,
    reverseLinkRelation: SERENITY_CAST,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SERENITY_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.HOLY_WORD_SERENITY_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // Link Holy Word Sanctify casts to heal events
  {
    linkRelation: SANCTIFY_CAST,
    reverseLinkRelation: SANCTIFY_CAST,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // Link Holy Word Salvation casts to heal events
  {
    linkRelation: SALVATION_CAST,
    reverseLinkRelation: SALVATION_CAST,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // Link Holy Word Chastise casts to damage events
  {
    linkRelation: CHASTISE_CAST,
    reverseLinkRelation: CHASTISE_CAST,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: LIGHTWELL_RENEW_HEALS,
    reverseLinkRelation: LIGHTWELL_RENEW_HEALS,
    linkingEventId: SPELLS.LIGHTWELL_TALENT_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: 6010,
    anyTarget: false,
  },
  {
    linkRelation: SALVATION_RENEW_HEALS,
    reverseLinkRelation: SALVATION_RENEW_HEALS,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: 15010,
    anyTarget: false,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrayerOfHealingEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, POH_CAST, (e): e is HealEvent => e.type === EventType.Heal);
}

export function getCircleOfHealingEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, COH_CAST, (e): e is HealEvent => e.type === EventType.Heal);
}

export function getHeal(event: CastEvent): HealEvent | undefined {
  return GetRelatedEvents<HealEvent>(
    event,
    FROM_HARDCAST,
    (e): e is HealEvent => e.type === EventType.Heal,
  ).pop();
}

export function getSerenityHealEvent(event: CastEvent): HealEvent {
  return GetRelatedEvent(event, SERENITY_CAST, (e): e is HealEvent => e.type === EventType.Heal)!;
}

export function getSanctifyHealEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, SANCTIFY_CAST, (e): e is HealEvent => e.type === EventType.Heal);
}

export function getSalvationHealEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, SALVATION_CAST, (e): e is HealEvent => e.type === EventType.Heal);
}

export function getChastiseDamageEvent(event: CastEvent): DamageEvent {
  return GetRelatedEvent(
    event,
    CHASTISE_CAST,
    (e): e is DamageEvent => e.type === EventType.Damage,
  )!;
}

export function isCastBuffedByLightweaver(event: CastEvent) {
  return HasRelatedEvent(event, LIGHTWEAVER_CONSUME);
}

export default CastLinkNormalizer;
