import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  EventType,
  HasRelatedEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';

export const FROM_HARDCAST = 'FromHardcast';
export const FROM_TEMPORAL_ANOMALY = 'FromTemporalAnomaly';
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly';
export const ECHO = 'Echo';

const CAST_BUFFER_MS = 100;
/*
  This file is for attributing echo applications to hard casts or to temporal anomaly.
  It is needed because echo can apply indrectly from temporal anomaly and 
  not just from a hard cast and has a reduced transfer rate
  */
const EVENT_LINKS: EventLink[] = [
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
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
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
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
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
  if (HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY)) {
    return false;
  }
  if (HasRelatedEvent(event, ECHO)) {
    return true;
  }
  return false;
}

export function isFromTemporalAnomaly(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export default CastLinkNormalizer;
