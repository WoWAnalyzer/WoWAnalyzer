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
  GetRelatedEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { CAST_BUFFER_MS, FROM_HARDCAST } from './CastLinkNormalizer';
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

/**@returns `true` if the linking event comes *after* the referenced event, `false` otherwise. */
const isFutureEvent = (linkingEvent: AnyEvent, referencedEvent: AnyEvent): boolean => {
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
    additionalCondition: isFutureEvent,
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
  },
];

export default class SepsisLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SEPSIS_TALENT);
  }
}

/** Returns the *instantaneous* ApplyDebuffEvent for the given Sepsis cast. */
export const getDebuffApplicationFromHardcast = (
  event: CastEvent,
): ApplyDebuffEvent | undefined => {
  return GetRelatedEvent(
    event,
    INSTANT_APPLICATION,
    (e): e is ApplyDebuffEvent => e.type === EventType.ApplyDebuff,
  );
};
/** Returns the ApplyBuffEvent for the given Sepsis cast with the relation given by,
 * @param {string} relation either `"InstantAuraApplication"` or `"DelayedAuraApplication"`
 * */
export const getRelatedBuffApplicationFromHardcast = (
  event: CastEvent,
  relation: typeof INSTANT_APPLICATION | typeof DELAYED_APPLICATION,
): ApplyBuffEvent | undefined => {
  return GetRelatedEvent(
    event,
    relation,
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff,
  );
};

/** Returns the stealth ability `CastEvent` for the given Sepsis `BuffEvent` if any exists, and `undefined` otherwise.
 * An `undefined` return implies the buff went unused
 */
export const getSepsisConsumptionCastForBuffEvent = (
  event: ApplyBuffEvent | RemoveBuffEvent,
): CastEvent | undefined => {
  if (event.type === EventType.ApplyBuff) {
    const removeBuffEvent = getAuraLifetimeEvent(event);
    event = removeBuffEvent ? removeBuffEvent : event;
  }
  return GetRelatedEvent(
    event,
    BUFF_CONSUMPTION_EVENT,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
};

type MatchedLifetimeEvent<
  T extends ApplyBuffEvent | RemoveBuffEvent | ApplyDebuffEvent | RemoveDebuffEvent,
> = T extends ApplyBuffEvent
  ? RemoveBuffEvent
  : T extends RemoveBuffEvent
    ? ApplyBuffEvent
    : T extends ApplyDebuffEvent
      ? RemoveDebuffEvent
      : T extends RemoveDebuffEvent
        ? ApplyDebuffEvent
        : never;
/** Returns either the starting or ending event for the buff related to the given event. ie If given application event it will return removal and vice versa*/
export function getAuraLifetimeEvent<
  T extends ApplyBuffEvent | RemoveBuffEvent | ApplyDebuffEvent | RemoveDebuffEvent,
>(event: T): MatchedLifetimeEvent<T> | undefined {
  return GetRelatedEvent(
    event,
    AURA_LIFETIME_EVENT,
    (matchedEvent): matchedEvent is MatchedLifetimeEvent<T> =>
      matchedEvent.type === EventType.ApplyBuff ||
      matchedEvent.type === EventType.RemoveBuff ||
      matchedEvent.type === EventType.ApplyDebuff ||
      matchedEvent.type === EventType.RemoveDebuff,
  );
}
