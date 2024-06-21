import {
  AbilityEvent,
  HasRelatedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  HealEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  CastEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  EmpowerEndEvent,
  EventType,
  ApplyBuffStackEvent,
  AnyEvent,
  SummonEvent,
} from 'parser/core/Events';
import {
  ECHO,
  ECHO_REMOVAL,
  ECHO_TEMPORAL_ANOMALY,
  TA_ECHO_REMOVAL,
  LIVING_FLAME_CALL_OF_YSERA,
  DREAM_BREATH_CALL_OF_YSERA_HOT,
  FIELD_OF_DREAMS_PROC,
  ESSENCE_BURST_CONSUME,
  LIFEBIND_HEAL,
  ECHO_TYPE,
  LIFEBIND,
  LIFEBIND_APPLY,
  GOLDEN_HOUR,
  HEAL_GROUPING,
  BUFF_GROUPING,
  STASIS,
  ESSENCE_BURST_LINK,
  SPARK_OF_INSIGHT,
  FROM_HARDCAST,
  STASIS_FOR_RAMP,
  ANCIENT_FLAME_CONSUME,
  ANCIENT_FLAME,
  EB_REVERSION,
  TIME_OF_NEED_HEALING,
  LIFESPARK_LIVING_FLAME,
  T32_2PC,
  REVERSION,
  T32_4PC,
  EMERALD_BLOSSOM_CAST,
  DREAM_BREATH,
} from './constants';

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcastEcho(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, ECHO) || HasRelatedEvent(event, ECHO_REMOVAL);
}

export function isFromTAEcho(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY) || HasRelatedEvent(event, TA_ECHO_REMOVAL);
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

export function isFromFieldOfDreams(event: HealEvent) {
  return HasRelatedEvent(event, FIELD_OF_DREAMS_PROC);
}

export function didEchoExpire(event: RemoveBuffEvent) {
  return !HasRelatedEvent(event, ECHO) && !HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export function getEssenceBurstConsumeAbility(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): null | CastEvent {
  return GetRelatedEvent<CastEvent>(event, ESSENCE_BURST_CONSUME) ?? null;
}

export function getHealForLifebindHeal(event: HealEvent): HealEvent | null {
  if (!HasRelatedEvent(event, LIFEBIND_HEAL)) {
    event.__modified = false;
    return null;
  }
  return GetRelatedEvent<HealEvent>(event, LIFEBIND_HEAL)!;
}

export function getEchoTypeForLifebind(event: HealEvent): ECHO_TYPE {
  if (!HasRelatedEvent(event, LIFEBIND) || event.targetID === event.sourceID) {
    return ECHO_TYPE.NONE;
  }
  const lifebindApplyEvent: ApplyBuffEvent = GetRelatedEvent(event, LIFEBIND)!;
  if (lifebindApplyEvent.prepull) {
    return ECHO_TYPE.NONE;
  }
  const veHeal: HealEvent = GetRelatedEvent(lifebindApplyEvent, LIFEBIND_APPLY)!;
  if (HasRelatedEvent(veHeal, ECHO)) {
    return ECHO_TYPE.HARDCAST;
  } else if (HasRelatedEvent(veHeal, ECHO_TEMPORAL_ANOMALY)) {
    return ECHO_TYPE.TA;
  }
  return ECHO_TYPE.NONE;
}

export function getEchoTypeForGoldenHour(event: HealEvent): ECHO_TYPE {
  const reversionEvent = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(event, GOLDEN_HOUR)!;
  if (isFromHardcastEcho(reversionEvent)) {
    return ECHO_TYPE.HARDCAST;
  } else if (isFromTAEcho(reversionEvent)) {
    return ECHO_TYPE.TA;
  }
  return ECHO_TYPE.NONE;
}

export function getHealEvents(event: HealEvent) {
  return [event].concat(GetRelatedEvents<HealEvent>(event, HEAL_GROUPING));
}

export function getBuffEvents(event: ApplyBuffEvent) {
  return [event].concat(GetRelatedEvents<ApplyBuffEvent>(event, BUFF_GROUPING));
}

export function getStasisSpell(event: RemoveBuffStackEvent | RemoveBuffEvent): number | null {
  const stasisEvent = GetRelatedEvent<CastEvent | EmpowerEndEvent>(event, STASIS);
  if (!stasisEvent) {
    return null;
  }
  if (stasisEvent.type === EventType.Cast) {
    return stasisEvent.ability.guid;
  }
  return stasisEvent.ability.guid;
}

export function didSparkProcEssenceBurst(
  event:
    | ApplyBuffEvent
    | RemoveBuffEvent
    | RemoveBuffStackEvent
    | RefreshBuffEvent
    | ApplyBuffStackEvent,
) {
  let applyEvent: AnyEvent | undefined = event;
  if (applyEvent.type === EventType.RemoveBuff || applyEvent.type === EventType.RemoveBuffStack) {
    applyEvent = GetRelatedEvent(event, ESSENCE_BURST_LINK);
  }
  if (applyEvent === undefined) {
    return;
  }
  return HasRelatedEvent(applyEvent, SPARK_OF_INSIGHT);
}

export function isEbFromHardcast(
  event:
    | ApplyBuffEvent
    | RemoveBuffEvent
    | RemoveBuffStackEvent
    | RefreshBuffEvent
    | ApplyBuffStackEvent,
) {
  let applyEvent: AnyEvent | undefined = event;
  if (applyEvent.type === EventType.RemoveBuff || applyEvent.type === EventType.RemoveBuffStack) {
    applyEvent = GetRelatedEvent(event, ESSENCE_BURST_LINK);
  }
  if (applyEvent === undefined) {
    return;
  }
  const lfEvent = GetRelatedEvent(applyEvent, FROM_HARDCAST);
  if (!lfEvent) {
    return false;
  }
  return lfEvent.type === EventType.Cast;
}

export function didEbConsumeSparkProc(event: RemoveBuffEvent | RemoveBuffStackEvent) {
  const applyEvent = GetRelatedEvent(event, ESSENCE_BURST_LINK)!;
  return HasRelatedEvent(applyEvent, SPARK_OF_INSIGHT);
}

export function wasEbConsumed(event: ApplyBuffEvent | ApplyBuffStackEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_LINK);
}

export function isStasisForRamp(event: RemoveBuffEvent) {
  return HasRelatedEvent(event, STASIS_FOR_RAMP);
}

export function getAncientFlameSource(event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
  return GetRelatedEvent(
    event,
    event.type === EventType.RemoveBuff ? ANCIENT_FLAME_CONSUME : ANCIENT_FLAME,
  )!;
}

export function isEbFromReversion(
  event:
    | ApplyBuffEvent
    | RefreshBuffEvent
    | ApplyBuffStackEvent
    | RemoveBuffEvent
    | RemoveBuffStackEvent,
) {
  if (event.type === EventType.RemoveBuff || event.type === EventType.RemoveBuffStack) {
    event = GetRelatedEvent(event, ESSENCE_BURST_LINK)!;
  }
  return HasRelatedEvent(event, EB_REVERSION);
}

export function getTimeOfNeedHealing(event: SummonEvent) {
  return GetRelatedEvents<HealEvent>(event, TIME_OF_NEED_HEALING) ?? null;
}

export function getLifesparkLivingFlame(event: RemoveBuffEvent | RemoveBuffStackEvent) {
  return GetRelatedEvent(event, LIFESPARK_LIVING_FLAME) ?? null;
}

export function getT32SourceEvent(event: HealEvent): HealEvent | undefined {
  return GetRelatedEvent<HealEvent>(event, T32_2PC);
}

export function isRevBuffedFromT32(event: HealEvent): boolean {
  const applyEvent = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(event, REVERSION);
  if (!applyEvent) {
    return false;
  }
  return HasRelatedEvent(applyEvent, T32_4PC);
}

export function isT32ProcWasted(event: RemoveBuffEvent | RefreshBuffEvent): boolean {
  return event.type === EventType.RefreshBuff || !HasRelatedEvent(event, T32_4PC);
}

//Gets the cast event from a blossom heal
export function getBlossomCast(event: HealEvent) {
  return GetRelatedEvent<CastEvent>(event, EMERALD_BLOSSOM_CAST);
}

//Find if a cast was from an essence burst
export function isCastFromBurst(event: CastEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_CONSUME);
}

export function getEchoAplication(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent) {
  const EchoRemoval = GetRelatedEvent(event, ECHO);
  if (EchoRemoval) {
    const EchoAplication = GetRelatedEvent(EchoRemoval, ECHO_REMOVAL);
    if (EchoAplication) {
      return GetRelatedEvent<CastEvent>(EchoAplication, FROM_HARDCAST);
    }
  }
}

export function getDreamBreathHealing(event: ApplyBuffEvent | RefreshBuffEvent) {
  return GetRelatedEvents<HealEvent>(event, DREAM_BREATH);
}

export function getReversionHealing(event: ApplyBuffEvent | RefreshBuffEvent) {
  return GetRelatedEvents<HealEvent>(event, REVERSION);
}
