import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import talents from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import { CAST_BUFFER_MS, PWAVE_TRAVEL_MS } from '../constants';

/*
  This file is for normalizing event links the various events to the two buffs associated with Resto Shamans Tier 30 set bonus
  Mainly needed because of primordial wave healing waves latency, the others can use this.selectedCombatant.hasBuff()
  */
const SWELLING_RAIN_REMOVE = 'Swelling Rain Removed';
const SWELLING_RAIN_HEALING_WAVE = 'Swelling Rain Healing Rain';
const TIDEWATERS_HEAL = 'Tidewaters Heal';
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SWELLING_RAIN_REMOVE,
    reverseLinkRelation: SWELLING_RAIN_REMOVE,
    linkingEventId: [ITEMS.T30_SWELLING_RAIN_BUFF.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [
      talents.HEALING_WAVE_TALENT.id,
      SPELLS.HEALING_SURGE.id,
      talents.CHAIN_HEAL_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.has4PieceByTier(TIERS.T30);
    },
  },
  {
    linkRelation: SWELLING_RAIN_HEALING_WAVE,
    reverseLinkRelation: SWELLING_RAIN_HEALING_WAVE,
    linkingEventId: [talents.HEALING_WAVE_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.HEALING_WAVE_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: PWAVE_TRAVEL_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.has4PieceByTier(TIERS.T30);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(referencedEvent, SWELLING_RAIN_REMOVE) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid
      );
    },
  },
  {
    linkRelation: TIDEWATERS_HEAL,
    reverseLinkRelation: TIDEWATERS_HEAL,
    linkingEventId: [ITEMS.T30_TIDEWATERS_HEAL.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.HEALING_RAIN_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.has2PieceByTier(TIERS.T30);
    },
  },
];

export default class Tier30Normalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSwellingRainHealingWaves(event: CastEvent): HealEvent[] {
  if (!HasRelatedEvent(event, SWELLING_RAIN_REMOVE)) {
    return [];
  }
  return GetRelatedEvents(event, SWELLING_RAIN_HEALING_WAVE) as HealEvent[];
}

export function getTidewatersHealingEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, TIDEWATERS_HEAL) as HealEvent[];
}
