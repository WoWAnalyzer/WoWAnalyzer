import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_MONK } from 'common/TALENTS';
import {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';

export const APPLIED_HEAL = 'AppliedHeal';
export const BOUNCED = 'Bounced';
export const FROM_DANCING_MISTS = 'FromDM';
export const FROM_HARDCAST = 'FromHardcast';
export const FROM_MISTY_PEAKS = 'FromMistyPeaks';
export const FROM_RAPID_DIFFUSION = 'FromRD'; // can be linked to env mist or rsk cast

const CAST_BUFFER_MS = 100;
const MAX_REM_DURATION = 77000;
const FOUND_REMS = new Set();

/*
  This file is for attributing Renewing Mist and Enveloping Mist applications to hard casts.
  It is needed because mistweaver talents can proc ReM/EnvM, 
  but they are not extended by RM nor do they trigger the flat RM Heal
  */
const EVENT_LINKS: EventLink[] = [
  // link renewing mist apply to its CastEvent
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // link Enveloping Mist apply to its cast
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id, SPELLS.ENVELOPING_MIST_TFT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // link renewing mist apply to the target it was removed from
  {
    linkRelation: BOUNCED,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.RENEWING_MIST_HEAL.id,
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !== (referencedEvent as RemoveBuffEvent).targetID
      );
    },
  },
  // link renewing mist removal to its application event
  {
    linkRelation: BOUNCED,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: SPELLS.RENEWING_MIST_HEAL.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_REM_DURATION,
  },
  // link ReM to an EnvM/RSK cast
  {
    linkRelation: FROM_RAPID_DIFFUSION,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      SPELLS.ENVELOPING_MIST_TFT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, FROM_HARDCAST);
    },
  },
  // two REMs happen in same timestamp when dancing mists procs
  {
    linkRelation: FROM_DANCING_MISTS,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff],
    referencedEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    referencedEventType: [EventType.ApplyBuff],
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !== (referencedEvent as ApplyBuffEvent).targetID
      );
    },
  },
  // misty peaks proc from a ReM hot event
  {
    linkRelation: FROM_MISTY_PEAKS,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.RENEWING_MIST_HEAL.id,
    referencedEventType: [EventType.Heal],
    anyTarget: true,
    backwardBufferMs: 50,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, FROM_HARDCAST);
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
 * This normalizer adds links for Renewing Mist and Enveloping Mist
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

// given list of events, find event closest to given timestamp
function getClosestEvent(timestamp: number, events: AnyEvent[]): AnyEvent {
  let minEvent = events[0];
  events.forEach(function (ev) {
    if (Math.abs(timestamp - ev.timestamp) < Math.abs(timestamp - minEvent.timestamp)) {
      minEvent = ev;
    }
  });
  return minEvent;
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  if (HasRelatedEvent(event, FROM_RAPID_DIFFUSION) || HasRelatedEvent(event, FROM_MISTY_PEAKS)) {
    return false;
  }
  // 2nd ReM application is the duplicated event
  if (HasRelatedEvent(event, FROM_DANCING_MISTS)) {
    if (FOUND_REMS.has(event.timestamp)) {
      return false;
    } else {
      FOUND_REMS.add(event.timestamp);
    }
  }
  if (HasRelatedEvent(event, FROM_HARDCAST)) {
    return true;
  }
  if (HasRelatedEvent(event, BOUNCED)) {
    const relatedEvents = GetRelatedEvents(event, BOUNCED);
    // There can be multiple linked applications/removals if multiple ReM's bouce close together
    // so filter out each linked events and find the one with the closest timestamp
    const minEvent =
      relatedEvents.length > 1 ? getClosestEvent(event.timestamp, relatedEvents) : relatedEvents[0];
    // we linked event as sourced from either a remove, apply, or refresh, so we recurse to track down the source of the linked event
    if (minEvent.type === EventType.ApplyBuff) {
      return isFromHardcast(minEvent as ApplyBuffEvent);
    } else if (minEvent.type === EventType.RemoveBuff) {
      return isFromHardcast(minEvent as RemoveBuffEvent);
    } else {
      return isFromHardcast(minEvent as RefreshBuffEvent);
    }
  }
  return false;
}

export function isFromMistyPeaks(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, FROM_MISTY_PEAKS);
}

export default CastLinkNormalizer;
