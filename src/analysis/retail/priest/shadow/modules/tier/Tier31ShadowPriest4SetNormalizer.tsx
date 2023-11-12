import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  DamageEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
const HITS_TARGET = 'HitsTarget';
const CONSUMES_T31_BUFF = 'ConsumesT31';

const BUFFER_MS = 1000;
const SC_TRAVEL_BUFFER_MS = 3000; // long buffer to look for damage events to be safe - SC has much longer cooldown so this should be fine

/*
  This file is for normalizing event links the various events to the  buff associated with Shadow Priest Tier 31 set bonus
  */
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CONSUMES_T31_BUFF,
    linkingEventId: [TALENTS.SHADOW_CRASH_TALENT.id, SPELLS.SHADOW_WORD_PAIN.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
  {
    linkRelation: HITS_TARGET,
    linkingEventId: SPELLS.SHADOW_WORD_PAIN.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.SHADOW_WORD_PAIN.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    additionalCondition: (linkingEvent, referencedEvent) =>
      referencedEvent.type === EventType.Damage && !referencedEvent.tick,
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
  {
    linkRelation: HITS_TARGET,
    linkingEventId: TALENTS.SHADOW_CRASH_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.SHADOW_CRASH_TALENT_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: SC_TRAVEL_BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
];

export default class Tier31FourSetNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function consumedT31Buff(event: CastEvent): boolean {
  return HasRelatedEvent(event, CONSUMES_T31_BUFF);
}

export function getHits(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents<DamageEvent>(event, HITS_TARGET);
}
