import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  EventType,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';

export const FROM_ECHO_HARDCAST = 'FromHardcast';
export const FROM_TEMPORAL_ANOMALY = 'FromTemporalAnomaly';
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly';
export const ECHO = 'Echo';
export const DREAM_BREATH_CALL_OF_YSERA = 'DreamBreathCallOfYsera';
export const DREAM_BREATH_CALL_OF_YSERA_HOT = 'DreamBreathCallOfYseraHoT';
export const LIVING_FLAME_CALL_OF_YSERA = 'LivingFlameCallOfYsera';
export const FLUTTERING_SEEDLINGS_ECHO = 'FlutteringSeedlingsEcho';
export const FLUTTERING_SEEDLINGS_HARDCAST = 'FlutteringSeedlingsHardcast';

const CAST_BUFFER_MS = 100;
const EB_BUFFER_MS = 2000;
/*
  This file is for attributing echo applications to hard casts or to temporal anomaly.
  It is needed because echo can apply indrectly from temporal anomaly and 
  not just from a hard cast and has a reduced transfer rate
  */
const EVENT_LINKS: EventLink[] = [
  // link Echo apply to its CastEvent
  {
    linkRelation: FROM_ECHO_HARDCAST,
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
  // link echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO,
    linkingEventId: [
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
    ],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY);
    },
  },
  // special handling for Echo EB because it heals 3-5 targets and happens after 2s
  {
    linkRelation: ECHO,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: EB_BUFFER_MS,
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
      return !HasRelatedEvent(referencedEvent, FROM_ECHO_HARDCAST);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // link TA echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: [
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
    ],
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FROM_ECHO_HARDCAST);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // special handling for TA Echo EB because it heals 3-5 targets and happens after 2s
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: EB_BUFFER_MS,
    additionalCondition(referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FROM_ECHO_HARDCAST);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // link seedling heal to Emerald Blossom echo heal
  {
    linkRelation: FLUTTERING_SEEDLINGS_ECHO,
    reverseLinkRelation: FLUTTERING_SEEDLINGS_ECHO,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    maximumLinks: 2,
    forwardBufferMs: EB_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(referencedEvent, FLUTTERING_SEEDLINGS_ECHO) &&
        (HasRelatedEvent(linkingEvent, ECHO) ||
          HasRelatedEvent(linkingEvent, ECHO_TEMPORAL_ANOMALY))
      );
    },
  },
  // link seedling heal to Emerald Blossom cast
  {
    linkRelation: FLUTTERING_SEEDLINGS_HARDCAST,
    reverseLinkRelation: FLUTTERING_SEEDLINGS_HARDCAST,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    maximumLinks: 2,
    forwardBufferMs: EB_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, FLUTTERING_SEEDLINGS_ECHO);
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
    // additionalCondition(referencedEvent) {
    //   return HasRelatedEvent(referencedEvent, DREAM_BREATH_CALL_OF_YSERA);
    // },
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
export function isFromHardcastEcho(event: AbilityEvent<any>): boolean {
  if (event.ability.guid === SPELLS.FLUTTERING_SEEDLINGS_HEAL.id) {
    return HasRelatedEvent(event, FLUTTERING_SEEDLINGS_ECHO);
  }
  return HasRelatedEvent(event, ECHO);
}

export function isFromTAEcho(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  if (event.ability.guid === SPELLS.FLUTTERING_SEEDLINGS_HEAL.id) {
    return HasRelatedEvent(event, FLUTTERING_SEEDLINGS_ECHO);
  }
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export function isFromDreamBreathCallOfYsera(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  if (HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA)) {
    return false;
  }
  return HasRelatedEvent(event, DREAM_BREATH_CALL_OF_YSERA_HOT);
}

export function isFromLivingFlameCallOfYsera(event: HealEvent) {
  // if(HasRelatedEvent(event, DREAM_BREATH_CALL_OF_YSERA_HOT)){
  //   return false;
  // }
  return HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA);
}

export default CastLinkNormalizer;
