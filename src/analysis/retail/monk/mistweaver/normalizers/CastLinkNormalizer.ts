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
  ApplyBuffStackEvent,
  GetRelatedEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  FROM_MISTY_PEAKS,
  FROM_HARDCAST,
  CAST_BUFFER_MS,
  ENVELOPING_MIST_GOM,
  RENEWING_MIST_GOM,
  VIVIFY_GOM,
  EXPEL_HARM_GOM,
  SOOM_GOM,
  SHEILUNS_GIFT_GOM,
  REVIVAL_GOM,
  VIVIFY,
  SHEILUNS_GIFT,
  CALMING_COALESCENCE,
  MANA_TEA_CHANNEL,
  MANA_TEA_CAST_LINK,
  MT_BUFF_REMOVAL,
  MT_STACK_CHANGE,
  LIFECYCLES,
  SOURCE_APPLY,
  FROM_RAPID_DIFFUSION,
  FROM_DANCING_MISTS,
  DANCING_MIST_BUFFER_MS,
  BOUNCED,
  OVERHEAL_BOUNCE,
  FROM_MISTS_OF_LIFE,
  JFS_GOM,
  CRANE_STYLE_RSK,
  CRANE_STYLE_BOK,
  CRANE_STYLE_SCK,
  VIVACIOUS_VIVIFICATION,
  ZEN_PULSE_CONSUME,
  ZEN_PULSE_VIVIFY,
  STRENGTH_OF_THE_BLACK_OX,
} from './EventLinks/EventLinkConstants';
import { RENEWING_MIST_EVENT_LINKS } from './EventLinks/RenewingMistEventLinks';
import { GUST_OF_MISTS_EVENT_LINKS } from './EventLinks/GustOfMistEventLinks';
import { MANA_TEA_EVENT_LINKS } from './EventLinks/ManaTeaEventLinks';
import { VIVIFY_EVENT_LINKS } from './EventLinks/VivifyEventLinks';
import { ENVELOPING_MIST_EVENT_LINKS } from './EventLinks/EnvelopingMistEventLinks';
import { HERO_TALENT_EVENT_LINKS } from './EventLinks/HeroTalentEventLinks';

const FOUND_REMS: Map<string, number | null> = new Map();

/*
  This file is for attributing Renewing Mist and Enveloping Mist applications to hard casts.
  It is needed because mistweaver talents can proc ReM/EnvM,
  but not all are extended by RM nor do they trigger the flat RM Heal
  */
const EVENT_LINKS: EventLink[] = [
  ...RENEWING_MIST_EVENT_LINKS,
  ...GUST_OF_MISTS_EVENT_LINKS,
  ...MANA_TEA_EVENT_LINKS,
  ...VIVIFY_EVENT_LINKS,
  ...ENVELOPING_MIST_EVENT_LINKS,
  ...HERO_TALENT_EVENT_LINKS,
  {
    linkRelation: SHEILUNS_GIFT,
    linkingEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    },
    maximumLinks(c) {
      return c.hasTalent(TALENTS_MONK.LEGACY_OF_WISDOM_TALENT) ? 5 : 3;
    },
  },
  {
    linkRelation: CALMING_COALESCENCE,
    linkingEventId: [SPELLS.CALMING_COALESCENCE_BUFF.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [TALENTS_MONK.LIFE_COCOON_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.CALMING_COALESCENCE_TALENT);
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

export function isBounceTick(event: HealEvent) {
  return HasRelatedEvent(event, OVERHEAL_BOUNCE);
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

export function isFromRapidDiffusionRisingSunKick(event: ApplyBuffEvent | RefreshBuffEvent) {
  if (!HasRelatedEvent(event, FROM_RAPID_DIFFUSION)) {
    return false;
  }
  const rdSourceEvent = GetRelatedEvent(event, FROM_RAPID_DIFFUSION)!;
  return (
    rdSourceEvent.type === EventType.Cast &&
    rdSourceEvent.ability.guid === TALENTS_MONK.RISING_SUN_KICK_TALENT.id
  );
}

export function isFromRapidDiffusionEnvelopingMist(event: ApplyBuffEvent | RefreshBuffEvent) {
  if (!HasRelatedEvent(event, FROM_RAPID_DIFFUSION)) {
    return false;
  }
  const rdSourceEvent = GetRelatedEvents(event, FROM_RAPID_DIFFUSION);
  return (
    rdSourceEvent[0].type === EventType.Cast &&
    rdSourceEvent[0].ability.guid === TALENTS_MONK.ENVELOPING_MIST_TALENT.id
  );
}

export function isFromMistsOfLife(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_MISTS_OF_LIFE);
}

export function isFromDancingMists(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, FROM_DANCING_MISTS) && !HasRelatedEvent(event, FROM_MISTS_OF_LIFE);
}

//mastery
export function isFromEnvelopingMist(event: HealEvent) {
  return HasRelatedEvent(event, ENVELOPING_MIST_GOM);
}

export function isFromRenewingMist(event: HealEvent) {
  return HasRelatedEvent(event, RENEWING_MIST_GOM);
}

export function isFromVivify(event: HealEvent) {
  return HasRelatedEvent(event, VIVIFY_GOM);
}

export function isFromSheilunsGift(event: HealEvent) {
  return HasRelatedEvent(event, SHEILUNS_GIFT_GOM);
}

export function isFromRevival(event: HealEvent) {
  return HasRelatedEvent(event, REVIVAL_GOM);
}

export function isFromExpelHarm(event: HealEvent) {
  return HasRelatedEvent(event, EXPEL_HARM_GOM);
}

export function isFromSoothingMist(event: HealEvent) {
  return HasRelatedEvent(event, SOOM_GOM);
}

export function isFromJadefireStomp(event: HealEvent) {
  return HasRelatedEvent(event, JFS_GOM);
}

export function isFromCraneStyleRSK(event: HealEvent) {
  return HasRelatedEvent(event, CRANE_STYLE_RSK);
}

export function isFromCraneStyleBok(event: HealEvent) {
  return HasRelatedEvent(event, CRANE_STYLE_BOK);
}

export function isFromCraneStyleSCK(event: HealEvent) {
  return HasRelatedEvent(event, CRANE_STYLE_SCK);
}

export function isFromLifeCocoon(event: RemoveBuffEvent) {
  return HasRelatedEvent(event, CALMING_COALESCENCE);
}

export function getSheilunsGiftHits(event: CastEvent): HealEvent[] {
  return GetRelatedEvents<HealEvent>(event, SHEILUNS_GIFT);
}

//vivify
export function getInvigHitsPerCast(event: HealEvent) {
  return GetRelatedEvents(event, VIVIFY);
}

export function isVivaciousVivification(event: HealEvent) {
  return GetRelatedEvent(event, VIVACIOUS_VIVIFICATION);
}

export function getZenPulseHitsPerCast(event: HealEvent): HealEvent[] {
  return GetRelatedEvents<HealEvent>(event, ZEN_PULSE_VIVIFY);
}

export function isZenPulseConsumed(event: RemoveBuffEvent | RemoveBuffStackEvent) {
  return GetRelatedEvent(event, ZEN_PULSE_CONSUME);
}

// we use time to get stacks because it can be cast prepull
export function getManaTeaStacksConsumed(event: ApplyBuffEvent) {
  const diff = GetRelatedEvents(event, MT_BUFF_REMOVAL)[0]?.timestamp - event.timestamp || 0;
  // 1s of mana reduction per stack
  return Math.round(diff / 1000);
}

export function getManaTeaChannelDuration(event: ApplyBuffEvent) {
  const castEvent = GetRelatedEvent(event, MANA_TEA_CAST_LINK);
  if (castEvent === undefined) {
    return undefined;
  }
  return GetRelatedEvent(castEvent, MANA_TEA_CHANNEL)!.timestamp - castEvent.timestamp;
}

export function isMTStackFromLifeCycles(
  event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent,
) {
  return HasRelatedEvent(event, LIFECYCLES);
}

export function HasStackChange(event: RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, MT_STACK_CHANGE);
}

// hero talents
export function isStrengthOfTheBlackOxConsumed(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, STRENGTH_OF_THE_BLACK_OX);
}

export default CastLinkNormalizer;
