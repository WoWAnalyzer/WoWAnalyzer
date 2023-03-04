import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import talents from 'common/TALENTS/shaman';
import {
  UNLEASH_LIFE_HEALING_WAVE,
  UNLEASH_LIFE_REMOVE,
  CAST_BUFFER_MS,
  PWAVE_TRAVEL_MS,
  UNLEASH_LIFE,
} from '../constants';
import SPELLS from 'common/SPELLS';

/*
  This file is for attributing the various sources of spell applications to their respective abilities and talents.
  It is needed because there are certain abilities that can have multiple sources based on talents, 
  i.e. riptide -> primorial wave & primal tide core
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
      talents.HEALING_WAVE_TALENT.id,
      SPELLS.HEALING_SURGE.id,
      talents.CHAIN_HEAL_TALENT.id,
      talents.HEALING_RAIN_TALENT.id,
      talents.DOWNPOUR_TALENT.id,
      talents.WELLSPRING_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    },
  },
  {
    linkRelation: UNLEASH_LIFE,
    reverseLinkRelation: UNLEASH_LIFE,
    linkingEventId: [talents.RIPTIDE_TALENT.id, SPELLS.HEALING_SURGE.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.RIPTIDE_TALENT.id, SPELLS.HEALING_SURGE.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: PWAVE_TRAVEL_MS,
    forwardBufferMs: CAST_BUFFER_MS,
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
  {
    linkRelation: UNLEASH_LIFE_HEALING_WAVE,
    reverseLinkRelation: UNLEASH_LIFE_HEALING_WAVE,
    linkingEventId: [talents.HEALING_WAVE_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.HEALING_WAVE_TALENT.id],
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

  /* linkingEventId: [
      talents.RIPTIDE_TALENT.id,
      SPELLS.HEALING_SURGE.id,

      talents.CHAIN_HEAL_TALENT.id,
      talents.HEALING_RAIN_TALENT.id,
      talents.DOWNPOUR_TALENT.id,
      SPELLS.WELLSPRING_UNLEASH_LIFE.id,
    ],*/
];

class UnleashLifeNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isBuffedByUnleashLife(event: CastEvent | HealEvent): boolean {
  return HasRelatedEvent(event, UNLEASH_LIFE_REMOVE) || HasRelatedEvent(event, UNLEASH_LIFE);
}

export function wasUnleashLifeConsumed(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, UNLEASH_LIFE_REMOVE);
}

export function getUnleashLifeHealingWaves(event: CastEvent): HealEvent[] {
  if (!HasRelatedEvent(event, UNLEASH_LIFE_REMOVE)) {
    return [];
  }
  return GetRelatedEvents(event, UNLEASH_LIFE_HEALING_WAVE) as HealEvent[];
}

export default UnleashLifeNormalizer;
