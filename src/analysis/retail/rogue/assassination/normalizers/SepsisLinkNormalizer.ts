import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import {
  AnyEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { CAST_BUFFER_MS, FROM_HARDCAST } from './CastLinkNormalizer';
import Combatant from 'parser/core/Combatant';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';

const CONSUME_ON_CAST_BUFFER_MS = 200;
export const SEPSIS_DEBUFF_DURATION = 10 * 1000;
export const SEPSIS_BUFF_DURATION = SEPSIS_DEBUFF_DURATION;

const STEALTH_ABILITY_IDS: number[] = [
  SPELLS.PICK_POCKET.id,
  SPELLS.CHEAP_SHOT.id,
  SPELLS.SAP.id,
  SPELLS.AMBUSH.id,
  SPELLS.SHADOWSTRIKE.id,
  SPELLS.GARROTE.id,
];

const AURA_LIFETIME_EVENT = 'AuraLifetimeEvent';
const INSTANT_APPLICATION = 'InstantAuraApplication';
const DELAYED_APPLICATION = 'DelayedAuraApplication';
const BUFF_CONSUMPTION_EVENT = 'BuffConsumptionEvent';
const isUsingSepsis = (c: Combatant): boolean => c.hasTalent(TALENTS.SEPSIS_TALENT);
const isDelayedBuffApplication = (linkingEvent: AnyEvent, referencedEvent: AnyEvent): boolean => {
  return linkingEvent.timestamp > referencedEvent.timestamp + CAST_BUFFER_MS;
};

const EVENT_LINKS: EventLink[] = [
  // Link an *instantaneous  Sepsis buff/debuff application to its corresponding cast
  {
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyDebuff],
    linkingEventId: [SPELLS.SEPSIS_BUFF.id, SPELLS.SEPSIS_DEBUFF.id],
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: INSTANT_APPLICATION,
    referencedEventId: TALENTS.SEPSIS_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive: isUsingSepsis,
  },
  // Link a Stealth Ability cast to the consumption of a Sepsis buff
  // Note: A "Blindside" Ambush will not be linked to the consumption of the Sepsis buff since the link only checks for the last 200ms, where rogue GCD is 1s.
  {
    linkingEventType: EventType.Cast,
    linkingEventId: STEALTH_ABILITY_IDS,
    linkRelation: BUFF_CONSUMPTION_EVENT,
    reverseLinkRelation: BUFF_CONSUMPTION_EVENT,
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.SEPSIS_BUFF.id,
    // Buff removed up to 200ms after stealth ability cast
    forwardBufferMs: CONSUME_ON_CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
    isActive: isUsingSepsis,
  },
  // Link a *delayed Sepsis buff application to its corresponding cast
  {
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: SPELLS.SEPSIS_BUFF.id,
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: DELAYED_APPLICATION,
    referencedEventType: EventType.Cast,
    referencedEventId: TALENTS.SEPSIS_TALENT.id,
    backwardBufferMs: SEPSIS_DEBUFF_DURATION + BUFF_DROP_BUFFER,
    maximumLinks: 1,
    anyTarget: true,
    isActive: isUsingSepsis,
    additionalCondition: isDelayedBuffApplication,
  },
  // Link a Sepsis a buff/debuff application event to its corresponding removal event and vice versa.
  // Im calling them "lifetime" events because with either you can get the full duration of the buff/debuff in events
  {
    linkingEventType: EventType.RemoveBuff,
    referencedEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.SEPSIS_BUFF.id,
    linkRelation: AURA_LIFETIME_EVENT,
    reverseLinkRelation: AURA_LIFETIME_EVENT,
    linkingEventId: SPELLS.SEPSIS_BUFF.id,
    // Sepsis Buffs/Debuffs both last 10s
    backwardBufferMs: SEPSIS_DEBUFF_DURATION + BUFF_DROP_BUFFER,
    maximumLinks: 1,
    isActive: isUsingSepsis,
  },
];

export default class SepsisLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns the *instantaneous* ApplyDebuffEvent for the given Sepsis cast. */
export const getDebuffApplicationFromHardcast = (
  event: CastEvent,
): ApplyDebuffEvent | undefined => {
  return GetRelatedEvents(event, INSTANT_APPLICATION)
    .filter((e): e is ApplyDebuffEvent => e.type === EventType.ApplyDebuff)
    .at(0);
};
/** Returns the ApplyBuffEvent for the given Sepsis cast with the relation given by,
 * @param {string} relation either `"InstantAuraApplication"` or `"DelayedAuraApplication"`
 * */
export const getRelatedBuffApplicationFromHardcast = (
  event: CastEvent,
  relation: typeof INSTANT_APPLICATION | typeof DELAYED_APPLICATION,
): ApplyBuffEvent | undefined => {
  return GetRelatedEvents(event, relation)
    .filter((e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff)
    .at(0);
};

/** Returns the stealth ability `CastEvent` for the given Sepsis `ApplyBuffEvent` or `RemoveBuffEvent`, if any exists. An `Undefined` result implies the buff went unused. */
export const getSepsisConsumptionCastForBuffEvent = (
  event: ApplyBuffEvent | RemoveBuffEvent,
): CastEvent | undefined => {
  if (event.type === EventType.ApplyBuff) {
    const removeBuffEvent = getAuraLifetimeEvent(event);
    event = removeBuffEvent ? removeBuffEvent : event;
  }
  return GetRelatedEvents(event, BUFF_CONSUMPTION_EVENT)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);
};

type MatchedLifetimeEvent<
  T extends ApplyBuffEvent | RemoveBuffEvent | ApplyDebuffEvent | RemoveDebuffEvent,
> = T extends ApplyBuffEvent
  ? RemoveBuffEvent | undefined
  : T extends RemoveBuffEvent
  ? ApplyBuffEvent | undefined
  : T extends ApplyDebuffEvent
  ? RemoveDebuffEvent | undefined
  : T extends RemoveDebuffEvent
  ? ApplyDebuffEvent | undefined
  : never;
/** Returns either the starting or ending event for the buff related to the given event. ie If given application event it will return removal and vice versa*/
export function getAuraLifetimeEvent<
  T extends ApplyBuffEvent | RemoveBuffEvent | ApplyDebuffEvent | RemoveDebuffEvent,
>(event: T): MatchedLifetimeEvent<T> {
  return GetRelatedEvents(event, AURA_LIFETIME_EVENT)
    .filter(
      (e): e is T =>
        e.type === EventType.ApplyBuff ||
        e.type === EventType.RemoveBuff ||
        e.type === EventType.ApplyDebuff ||
        e.type === EventType.RemoveDebuff,
    )
    .at(0) as MatchedLifetimeEvent<T>;
}
