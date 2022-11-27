import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

export const SHIELD_FROM_TA_CAST = 'ShieldFromTACast';
export const FROM_HARDCAST = 'FromHardcast';
export const FROM_TEMPORAL_ANOMALY = 'FromTemporalAnomaly';
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly';
export const ECHO = 'Echo';
export const DREAM_BREATH_CALL_OF_YSERA = 'DreamBreathCallOfYsera';
export const DREAM_BREATH_CALL_OF_YSERA_HOT = 'DreamBreathCallOfYseraHoT';
export const LIVING_FLAME_CALL_OF_YSERA = 'LivingFlameCallOfYsera';
export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption'; // link essence cast to removing the essence burst buff

const CAST_BUFFER_MS = 100;
const TA_BUFFER_MS = 6000 + CAST_BUFFER_MS; //TA pulses over 6s at 0% haste
/*
  This file is for attributing echo applications to hard casts or to temporal anomaly.
  It is needed because echo can apply indrectly from temporal anomaly and 
  not just from a hard cast and has a reduced transfer rate
  */
const EVENT_LINKS: EventLink[] = [
  //link shield apply to cast event
  {
    linkRelation: SHIELD_FROM_TA_CAST,
    linkingEventId: [SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: TA_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
    },
  },
  // link Echo apply to its CastEvent
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  //link hardcast echo removal to hot application
  {
    linkRelation: ECHO,
    linkingEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY);
    },
  },
  //link echo apply to the Temporal Anomaly shield application
  {
    linkRelation: FROM_TEMPORAL_ANOMALY,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  //link TA echo removal to hot application
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FROM_HARDCAST);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to the heals
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA_HOT,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.Heal],
    referencedEventId: [SPELLS.DREAM_BREATH_CAST.id],
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Dream Breath cast that consumed it
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA,
    linkingEventId: [SPELLS.CALL_OF_YSERA_BUFF.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.DREAM_BREATH_CAST.id],
    referencedEventType: [EventType.RemoveBuff],
    maximumLinks: 1,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Living Flame heal that consumed it
  {
    linkRelation: LIVING_FLAME_CALL_OF_YSERA,
    linkingEventId: [SPELLS.LIVING_FLAME_HEAL.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.CALL_OF_YSERA_BUFF.id],
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: 1100,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    },
  },
  // link essence burst remove to a cast to track expirations vs consumptions
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_CAST.id,
      SPELLS.DISINTEGRATE.id,
      TALENTS_EVOKER.ECHO_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_TALENT.id);
    },
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/RemoveBuff linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for Echo and Temporal Anomaly
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, ECHO);
}

export function isFromTemporalAnomaly(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export function isFromDreamBreathCallOfYsera(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  if (HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA)) {
    return false;
  }
  return HasRelatedEvent(event, DREAM_BREATH_CALL_OF_YSERA_HOT);
}

export function isFromLivingFlameCallOfYsera(event: HealEvent) {
  return HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA);
}

export function getEssenceBurstConsumeAbility(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): null | CastEvent {
  if (!HasRelatedEvent(event, ESSENCE_BURST_CONSUME)) {
    return null;
  }
  return GetRelatedEvents(event, ESSENCE_BURST_CONSUME)[0] as CastEvent;
}

export default CastLinkNormalizer;
