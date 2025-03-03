import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import talents from 'common/TALENTS/shaman';
import {
  UNLEASH_LIFE_HEALING_WAVE,
  UNLEASH_LIFE_REMOVE,
  CAST_BUFFER_MS,
  PWAVE_TRAVEL_MS,
  HARDCAST,
} from '../constants';
import SPELLS from 'common/SPELLS';

/*
  This file is for linking the various events to the unleash life buff
  It is needed because the buff can be removed in multiple different ways and links to many different events
*/
const EVENT_LINKS: EventLink[] = [
  //Unleash life linkings
  {
    linkRelation: UNLEASH_LIFE_REMOVE,
    reverseLinkRelation: UNLEASH_LIFE_REMOVE,
    linkingEventId: [talents.UNLEASH_LIFE_TALENT.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [
      talents.RIPTIDE_TALENT.id,
      SPELLS.HEALING_WAVE.id,
      SPELLS.HEALING_SURGE.id,
      talents.CHAIN_HEAL_TALENT.id,
      talents.HEALING_RAIN_TALENT.id,
      SPELLS.DOWNPOUR_ABILITY.id,
      talents.WELLSPRING_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    },
  },
  {
    linkRelation: UNLEASH_LIFE_REMOVE,
    reverseLinkRelation: UNLEASH_LIFE_REMOVE,
    linkingEventId: [talents.UNLEASH_LIFE_TALENT.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [talents.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.Heal, EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    },
  },
  {
    linkRelation: HARDCAST,
    reverseLinkRelation: HARDCAST,
    linkingEventId: [SPELLS.HEALING_SURGE.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.HEALING_SURGE.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(referencedEvent, UNLEASH_LIFE_REMOVE) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as CastEvent).targetID
      );
    },
  },
  {
    linkRelation: UNLEASH_LIFE_HEALING_WAVE,
    reverseLinkRelation: UNLEASH_LIFE_HEALING_WAVE,
    linkingEventId: [SPELLS.HEALING_WAVE.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.HEALING_WAVE.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: PWAVE_TRAVEL_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(referencedEvent, UNLEASH_LIFE_REMOVE) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid
      );
    },
  },
];

class UnleashLifeNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getCastEvent(event: HealEvent): CastEvent {
  return GetRelatedEvent(event, HARDCAST)!;
}

export function isBuffedByUnleashLife(
  event: CastEvent | HealEvent | ApplyBuffEvent | RefreshBuffEvent,
): boolean {
  return HasRelatedEvent(event, UNLEASH_LIFE_REMOVE);
}

export function wasUnleashLifeConsumed(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, UNLEASH_LIFE_REMOVE);
}

export function getUnleashLifeHealingWaves(event: CastEvent): HealEvent[] {
  if (!HasRelatedEvent(event, UNLEASH_LIFE_REMOVE)) {
    return [];
  }
  return GetRelatedEvents(event, UNLEASH_LIFE_HEALING_WAVE);
}

export default UnleashLifeNormalizer;
