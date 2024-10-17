import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/priest';
import { INSIGHT_CDR_ABILITIES, SPELLS_THAT_PROC_S1_4PC_HOLY_ID } from '../constants';

const CAST_BUFFER_MS = 200;

const FROM_HARDCAST = 'FromHardcast'; // for linking a heal to its cast
const POH_CAST = 'PrayerOfHealingCast';
const COH_CAST = 'CircleOfHealingCast';
const SERENITY_CAST = 'HolyWordSerenityCast';
const SANCTIFY_CAST = 'HolyWordSanctifyCast';
const SALVATION_CAST = 'HolyWordSalvationCast';
const CHASTISE_CAST = 'HolyWordChastiseCast';
export const BUFFED_BY_SURGE_OF_LIGHT = 'BuffedBySurgeOfLight';
export const BUFFED_BY_SURGE_OF_LIGHT_CAST = 'BuffedBySurgeOfLightCast';
const SURGE_OF_LIGHT_APPLIED_BY_HALO = 'SurgeOfLightAppliedByHalo';
const HALO_LINKED_TO_SURGE_OF_LIGHT = 'HaloLinkedtoSurgeOfLight';
const SPELL_SPENDS_INSIGHT_CHARGE = 'SpellSpendsInsightCharge';
const GET_SPELL_CAST_FROM_INSIGHT_CHARGE = 'GetSpellCastFromInsightCharge';
export const ECHO_OF_LIGHT_BUFF_REFRESH = 'EchOfLightRefresh';
export const ECHO_OF_LIGHT_ATTRIB_EVENT = 'GetEchoOfLight';
export const HARDCAST_POWER_WORD_SHIELD = 'HardCastPowerWordShield';
export const POWER_WORD_SHIELD_ABSORB = 'PowerWordShieldAbsorb';
export const LIGHTWELL_RENEW_HEALS = 'LightwellRenewHeal';
export const SALVATION_RENEW_HEALS = 'SalvationRenewHeal';
export const LIGHTWELL_RENEW = 'LightwellRenew';
export const SALVATION_RENEW = 'SalvationRenew';
export const BENEDICTION_RENEW = 'BenedictionRenew';
export const BENEDICTION_RENEW_HEALS = 'BenedictionRenewHeal';
export const REVIT_PRAYER_RENEW = 'RevitalizingPrayersRenew';
export const HARDCAST_RENEW = 'HardCastRenew';
export const HOLY_TWW_S1_4PC = 'HolyTwwS14pc';

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
    forwardBufferMs: 6000 + CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: SALVATION_RENEW_HEALS,
    reverseLinkRelation: SALVATION_RENEW_HEALS,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: 15000 + CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: LIGHTWELL_RENEW,
    reverseLinkRelation: LIGHTWELL_RENEW,
    linkingEventId: SPELLS.LIGHTWELL_TALENT_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: SALVATION_RENEW,
    reverseLinkRelation: SALVATION_RENEW,
    linkingEventId: TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: BENEDICTION_RENEW,
    reverseLinkRelation: BENEDICTION_RENEW,
    linkingEventId: SPELLS.PRAYER_OF_MENDING_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: REVIT_PRAYER_RENEW,
    reverseLinkRelation: REVIT_PRAYER_RENEW,
    linkingEventId: TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
    isActive(c) {
      return c.hasTalent(TALENTS_PRIEST.REVITALIZING_PRAYERS_TALENT);
    },
  },
  {
    linkRelation: HARDCAST_RENEW,
    reverseLinkRelation: HARDCAST_RENEW,
    linkingEventId: SPELLS.RENEW_HEAL.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
  },
  {
    linkRelation: HARDCAST_POWER_WORD_SHIELD,
    reverseLinkRelation: HARDCAST_POWER_WORD_SHIELD,
    linkingEventId: SPELLS.POWER_WORD_SHIELD.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.POWER_WORD_SHIELD.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
  },

  {
    linkRelation: POWER_WORD_SHIELD_ABSORB,
    reverseLinkRelation: POWER_WORD_SHIELD_ABSORB,
    linkingEventId: SPELLS.POWER_WORD_SHIELD.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.POWER_WORD_SHIELD.id,
    referencedEventType: EventType.Absorbed,
    forwardBufferMs: 15000 + CAST_BUFFER_MS,
    anyTarget: false,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, HARDCAST_POWER_WORD_SHIELD);
    },
  },
  {
    linkRelation: ECHO_OF_LIGHT_ATTRIB_EVENT,
    linkingEventId: null,
    linkingEventType: [EventType.Heal],
    referencedEventId: SPELLS.ECHO_OF_LIGHT_HEAL.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: 6000,
    anyTarget: false,
  },
  {
    linkRelation: BENEDICTION_RENEW_HEALS,
    reverseLinkRelation: BENEDICTION_RENEW_HEALS,
    linkingEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_PRIEST.RENEW_TALENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: 15000 + CAST_BUFFER_MS,
    anyTarget: false,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, BENEDICTION_RENEW) &&
        !HasRelatedEvent(referencedEvent, SALVATION_RENEW_HEALS)
      );
    },
  },
  {
    linkRelation: BUFFED_BY_SURGE_OF_LIGHT,
    reverseLinkRelation: BUFFED_BY_SURGE_OF_LIGHT,
    linkingEventId: SPELLS.FLASH_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.SURGE_OF_LIGHT_BUFF.id],
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BUFFED_BY_SURGE_OF_LIGHT_CAST,
    reverseLinkRelation: BUFFED_BY_SURGE_OF_LIGHT_CAST,
    linkingEventId: SPELLS.FLASH_HEAL.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.SURGE_OF_LIGHT_BUFF.id],
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: SURGE_OF_LIGHT_APPLIED_BY_HALO,
    reverseLinkRelation: HALO_LINKED_TO_SURGE_OF_LIGHT,
    linkingEventId: [SPELLS.HALO_TALENT.id, SPELLS.UNCAT_ARCHON_HALO_RETURN_BUFF.id],
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: [SPELLS.SURGE_OF_LIGHT_BUFF.id],
    referencedEventType: [EventType.ApplyBuffStack, EventType.ApplyBuff, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_PRIEST.MANIFESTED_POWER_TALENT);
    },
  },
  {
    linkRelation: SPELL_SPENDS_INSIGHT_CHARGE,
    reverseLinkRelation: GET_SPELL_CAST_FROM_INSIGHT_CHARGE,
    linkingEventId: INSIGHT_CDR_ABILITIES,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.PREMONITION_OF_INSIGHT_BUFF.id],
    referencedEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_PRIEST.PREMONITION_TALENT);
    },
  },
  {
    linkRelation: HOLY_TWW_S1_4PC,
    linkingEventId: SPELLS_THAT_PROC_S1_4PC_HOLY_ID,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS_THAT_PROC_S1_4PC_HOLY_ID,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
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

export function getHealFromSurge(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): HealEvent | undefined {
  return GetRelatedEvents<HealEvent>(
    event,
    BUFFED_BY_SURGE_OF_LIGHT,
    (e): e is HealEvent => e.type === EventType.Heal,
  ).pop();
}

export function isSurgeOfLightFromHalo(
  event: ApplyBuffStackEvent | ApplyBuffEvent | RefreshBuffEvent,
) {
  return HasRelatedEvent(event, HALO_LINKED_TO_SURGE_OF_LIGHT);
}

export function buffedBySurgeOfLight(event: RemoveBuffEvent | RemoveBuffStackEvent): boolean {
  return HasRelatedEvent(event, BUFFED_BY_SURGE_OF_LIGHT);
}

export function removesInsightCharge(event: CastEvent): boolean {
  return HasRelatedEvent(event, SPELL_SPENDS_INSIGHT_CHARGE);
}

export function isRenewFromSalv(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, SALVATION_RENEW);
}

export function isPWSHardCast(event: AbsorbedEvent): boolean {
  return HasRelatedEvent(event, HARDCAST_POWER_WORD_SHIELD);
}

export function getSOLFlashCast(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    BUFFED_BY_SURGE_OF_LIGHT_CAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

export default CastLinkNormalizer;
