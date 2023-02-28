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
  HealEvent,
  CastEvent,
} from 'parser/core/Events';

export const APPLIED_HEAL = 'AppliedHeal';
export const FORCE_BOUNCE = 'ForceBounce';
export const OVERHEAL_BOUNCE = 'OverhealBounce';
export const BOUNCED = 'Bounced';
export const ESSENCE_FONT = 'EssenceFont';
export const FROM_DANCING_MISTS = 'FromDM';
export const SOURCE_APPLY = 'SourceApply';
export const FROM_HARDCAST = 'FromHardcast';
export const FROM_MISTY_PEAKS = 'FromMistyPeaks';
export const FROM_MISTS_OF_LIFE = 'FromMOL';
export const FROM_RAPID_DIFFUSION = 'FromRD'; // can be linked to env mist or rsk cast
export const ENVELOPING_MIST_GOM = 'EnvGOM';
export const RENEWING_MIST_GOM = 'ReMGOM';
export const VIVIFY_GOM = 'ViVGOM';
export const REVIVAL_GOM = 'RevivalGOM';
export const ZEN_PULSE_GOM = 'ZPGOM';
export const SHEILUNS_GIFT_GOM = 'SGGOM';
export const EXPEL_HARM_GOM = 'EHGOM';
export const SOOM_GOM = 'SoomGOM';
export const VIVIFY = 'Vivify';

const RAPID_DIFFUSION_BUFFER_MS = 300;
const DANCING_MIST_BUFFER_MS = 250;
const CAST_BUFFER_MS = 100;
const EF_BUFFER = 7000;
const MAX_REM_DURATION = 77000;
const FOUND_REMS: Map<string, number | null> = new Map();

/*
  This file is for attributing Renewing Mist and Enveloping Mist applications to hard casts.
  It is needed because mistweaver talents can proc ReM/EnvM, 
  but not all are extended by RM nor do they trigger the flat RM Heal
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
  //link the remove buff event to cast - aka the Renewing Mist 'push'
  {
    linkRelation: FORCE_BOUNCE,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
    referencedEventType: [EventType.Cast],
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
  // link ReM application from Rapid diffusion
  {
    linkRelation: FROM_RAPID_DIFFUSION,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: RAPID_DIFFUSION_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, FROM_HARDCAST);
    },
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    },
  },
  // two REMs happen in same timestamp when dancing mists procs
  {
    linkRelation: FROM_DANCING_MISTS,
    reverseLinkRelation: SOURCE_APPLY,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff],
    referencedEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    referencedEventType: [EventType.ApplyBuff],
    anyTarget: true,
    backwardBufferMs: DANCING_MIST_BUFFER_MS,
    forwardBufferMs: DANCING_MIST_BUFFER_MS,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !==
          (referencedEvent as ApplyBuffEvent).targetID &&
        !HasRelatedEvent(linkingEvent, FORCE_BOUNCE)
      );
    },
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT);
    },
  },
  // From LC on target with Mists of Life talented
  {
    linkRelation: FROM_MISTS_OF_LIFE,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id, SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.LIFE_COCOON_TALENT.id,
    referencedEventType: [EventType.Cast],
    backwardBufferMs: 500,
    forwardBufferMs: 50,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(linkingEvent, FROM_HARDCAST) &&
        !HasRelatedEvent(referencedEvent, FROM_HARDCAST)
      );
    },
    isActive: (c) => {
      return c.hasTalent(TALENTS_MONK.MISTS_OF_LIFE_TALENT);
    },
  },
  // misty peaks proc from a ReM hot event
  {
    linkRelation: FROM_MISTY_PEAKS,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.RENEWING_MIST_HEAL.id,
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 100,
    additionalCondition(linkingEvent) {
      return !HasRelatedEvent(linkingEvent, FROM_HARDCAST);
    },
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT);
    },
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
  //Mastery event linking
  {
    linkRelation: ENVELOPING_MIST_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: RENEWING_MIST_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: VIVIFY_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: SPELLS.VIVIFY.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: ZEN_PULSE_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_MONK.ZEN_PULSE_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: EXPEL_HARM_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: SPELLS.EXPEL_HARM.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: SOOM_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_MONK.SOOTHING_MIST_TALENT.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: SHEILUNS_GIFT_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    },
  },
  {
    linkRelation: REVIVAL_GOM,
    linkingEventId: [SPELLS.GUSTS_OF_MISTS.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [TALENTS_MONK.REVIVAL_TALENT.id, TALENTS_MONK.RESTORAL_TALENT.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Cast, EventType.BeginChannel],
    referencedEventId: [SPELLS.VIVIFY.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: ESSENCE_FONT,
    linkingEventId: [TALENTS_MONK.ESSENCE_FONT_TALENT.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.ESSENCE_FONT_BUFF.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: EF_BUFFER,
    anyTarget: true,
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

export function getSourceRem(event: ApplyBuffEvent | RefreshBuffEvent) {
  return getClosestEvent(event.timestamp, GetRelatedEvents(event, SOURCE_APPLY)) as
    | ApplyBuffEvent
    | RefreshBuffEvent;
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  if (HasRelatedEvent(event, FROM_RAPID_DIFFUSION) || HasRelatedEvent(event, FROM_MISTY_PEAKS)) {
    return false;
  }
  // 2nd ReM application is the duplicated event
  if (HasRelatedEvent(event, FROM_DANCING_MISTS)) {
    const dmRem = FOUND_REMS.get(FROM_HARDCAST);
    if (
      dmRem! - DANCING_MIST_BUFFER_MS <= event.timestamp &&
      event.timestamp <= dmRem! + DANCING_MIST_BUFFER_MS
    ) {
      return false;
    } else {
      FOUND_REMS.set(FROM_HARDCAST, event.timestamp);
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

export function isForceBounce(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, FORCE_BOUNCE);
}

export function isFromMistyPeaks(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, FROM_MISTY_PEAKS);
}

export function isFromRapidDiffusion(event: ApplyBuffEvent | RefreshBuffEvent) {
  if (HasRelatedEvent(event, FROM_HARDCAST) || HasRelatedEvent(event, FROM_MISTS_OF_LIFE)) {
    return false;
  }
  // 2nd ReM application is the duplicated event
  if (HasRelatedEvent(event, FROM_DANCING_MISTS)) {
    const dmRem = FOUND_REMS.get(FROM_RAPID_DIFFUSION);
    if (
      dmRem! - DANCING_MIST_BUFFER_MS <= event.timestamp &&
      event.timestamp <= dmRem! + DANCING_MIST_BUFFER_MS
    ) {
      return false;
    } else {
      FOUND_REMS.set(FROM_RAPID_DIFFUSION, event.timestamp);
    }
  }
  return HasRelatedEvent(event, FROM_RAPID_DIFFUSION);
}

export function isFromMistsOfLife(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_MISTS_OF_LIFE);
}

export function isFromDancingMists(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_DANCING_MISTS) && !HasRelatedEvent(event, FROM_MISTS_OF_LIFE);
}

export function isFromEnvelopingMist(event: HealEvent) {
  return HasRelatedEvent(event, ENVELOPING_MIST_GOM) && !isFromEssenceFont(event);
}

export function isFromRenewingMist(event: HealEvent) {
  return HasRelatedEvent(event, RENEWING_MIST_GOM) && !isFromEssenceFont(event);
}

export function isFromVivify(event: HealEvent) {
  return HasRelatedEvent(event, VIVIFY_GOM) && !isFromEssenceFont(event);
}

export function isFromSheilunsGift(event: HealEvent) {
  return HasRelatedEvent(event, SHEILUNS_GIFT_GOM) && !isFromEssenceFont(event);
}

export function isFromRevival(event: HealEvent) {
  return HasRelatedEvent(event, REVIVAL_GOM) && !isFromEssenceFont(event);
}

export function isFromZenPulse(event: HealEvent) {
  return HasRelatedEvent(event, ZEN_PULSE_GOM) && !isFromEssenceFont(event);
}

export function isFromExpelHarm(event: HealEvent) {
  return HasRelatedEvent(event, EXPEL_HARM_GOM) && !isFromEssenceFont(event);
}

export function isFromSoothingMist(event: HealEvent) {
  return HasRelatedEvent(event, SOOM_GOM) && !isFromEssenceFont(event);
}

export function isFromEssenceFont(event: HealEvent) {
  return (
    !HasRelatedEvent(event, EXPEL_HARM_GOM) &&
    !HasRelatedEvent(event, ZEN_PULSE_GOM) &&
    !HasRelatedEvent(event, REVIVAL_GOM) &&
    !HasRelatedEvent(event, SHEILUNS_GIFT_GOM) &&
    !HasRelatedEvent(event, VIVIFY_GOM) &&
    !HasRelatedEvent(event, RENEWING_MIST_GOM) &&
    !HasRelatedEvent(event, ENVELOPING_MIST_GOM)
  );
}

export function getVivifiesPerCast(event: CastEvent) {
  return GetRelatedEvents(event, VIVIFY);
}

export function getNumberOfBolts(event: CastEvent) {
  return GetRelatedEvents(event, ESSENCE_FONT).length;
}

export default CastLinkNormalizer;
