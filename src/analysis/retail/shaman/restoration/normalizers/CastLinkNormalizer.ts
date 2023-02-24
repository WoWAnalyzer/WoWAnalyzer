import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import talents from 'common/TALENTS/shaman';
import {
  APPLIED_HEAL,
  PRIMAL_TIDE_CORE,
  HARDCAST,
  RIPTIDE_PWAVE,
  HEALING_WAVE_PWAVE,
  UNLEASH_LIFE,
} from '../constants';
import SPELLS from 'common/SPELLS';

const CAST_BUFFER_MS = 100;
const PWAVE_TRAVEL_MS = 1000;

/*
  This file is for attributing the various sources of spell applications to their respective abilities and talents.
  It is needed because there are certain abilities that can have multiple sources based on talents, 
  i.e. riptide -> primorial wave & primal tide core
*/
const EVENT_LINKS: EventLink[] = [
  //Riptide linking
  {
    linkRelation: HARDCAST,
    linkingEventId: [talents.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    referencedEventId: [talents.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      //extremely unlikely but you never know
      return c.hasTalent(talents.RIPTIDE_TALENT);
    },
  },
  {
    linkRelation: RIPTIDE_PWAVE,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [talents.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    referencedEventId: [talents.PRIMORDIAL_WAVE_TALENT.id],
    referencedEventType: [EventType.Cast],
    forwardBufferMs: PWAVE_TRAVEL_MS,
    backwardBufferMs: PWAVE_TRAVEL_MS,
    additionalCondition(referencedEvent) {
      return (referencedEvent as CastEvent).targetIsFriendly;
    },
    isActive(c) {
      return c.hasTalent(talents.PRIMORDIAL_WAVE_TALENT);
    },
  },
  {
    linkRelation: PRIMAL_TIDE_CORE,
    linkingEventId: [talents.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.Heal],
    referencedEventId: [talents.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    anyTarget: true,
    maximumLinks: 1,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !==
          (referencedEvent as ApplyBuffEvent).targetID &&
        !HasRelatedEvent(linkingEvent, HARDCAST) &&
        !HasRelatedEvent(linkingEvent, RIPTIDE_PWAVE)
      );
    },
    isActive(c) {
      return c.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT);
    },
  },
  //Healing Wave linking - necessary for pwave
  {
    linkRelation: HARDCAST,
    reverseLinkRelation: HARDCAST,
    linkingEventId: [talents.HEALING_WAVE_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.HEALING_WAVE_TALENT.id],
    referencedEventType: [EventType.Cast],
    maximumLinks: 1,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: HEALING_WAVE_PWAVE,
    linkingEventId: [talents.HEALING_WAVE_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [talents.HEALING_WAVE_TALENT.id],
    referencedEventType: [EventType.Cast],
    anyTarget: true,
    backwardBufferMs: PWAVE_TRAVEL_MS,
    forwardBufferMs: PWAVE_TRAVEL_MS,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, HARDCAST);
    },
  },
  //Unleash life linking
  {
    linkRelation: UNLEASH_LIFE,
    linkingEventId: [talents.UNLEASH_LIFE_TALENT.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [talents.RIPTIDE_TALENT.id, talents.HEALING_WAVE_TALENT.id, SPELLS.HEALING_SURGE.id, talents.CHAIN_HEAL_TALENT.id, talents.HEALING_RAIN_TALENT.id, talents.DOWNPOUR_TALENT.id, talents.WELLSPRING_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.UNLEASH_LIFE_TALENT);
    }
  }
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, HARDCAST);
}

export function isRiptideFromPrimordialWave(
  event: ApplyBuffEvent | RefreshBuffEvent | HealEvent,
): boolean {
  return HasRelatedEvent(event, RIPTIDE_PWAVE);
}

export function isHealingWaveFromPrimordialWave(event: HealEvent): boolean {
  return HasRelatedEvent(event, HEALING_WAVE_PWAVE);
}

export function isFromPrimalTideCore(event: ApplyBuffEvent | HealEvent): boolean {
  return !HasRelatedEvent(event, HARDCAST) && !HasRelatedEvent(event, RIPTIDE_PWAVE);
}

export default CastLinkNormalizer;
