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
} from 'parser/core/Events';
import ITEMS from 'common/ITEMS';

const APPLIED_HEAL = 'AppliedHeal';
const FORCE_BOUNCE = 'ForceBounce';
const OVERHEAL_BOUNCE = 'OverhealBounce';
const BOUNCED = 'Bounced';
const ESSENCE_FONT = 'EssenceFont';
const FROM_DANCING_MISTS = 'FromDM';
const SOURCE_APPLY = 'SourceApply';
const FROM_HARDCAST = 'FromHardcast';
const FROM_MISTY_PEAKS = 'FromMistyPeaks';
const FROM_MISTS_OF_LIFE = 'FromMOL';
const FROM_RAPID_DIFFUSION = 'FromRD'; // can be linked to env mist or rsk cast
const ENVELOPING_MIST_GOM = 'EnvGOM';
const RENEWING_MIST_GOM = 'ReMGOM';
const VIVIFY_GOM = 'ViVGOM';
const REVIVAL_GOM = 'RevivalGOM';
const ZEN_PULSE_GOM = 'ZPGOM';
const SHEILUNS_GIFT_GOM = 'SGGOM';
const SHEILUNS_GIFT = 'SheilunsGift';
const EXPEL_HARM_GOM = 'EHGOM';
const SOOM_GOM = 'SoomGOM';
const VIVIFY = 'Vivify';
const CALMING_COALESCENCE = 'Calming Coalescence';
const MANA_TEA_CHANNEL = 'MTChannel';
const MANA_TEA_CAST_LINK = 'MTLink';
const MT_BUFF_REMOVAL = 'MTStack';
const LIFECYCLES = 'Lifecycles';
const MT_STACK_CHANGE = 'MTStackChange';
const ANCIENT_TEACHINGS_FLS = 'ATFaelineStomp';
const ANCIENT_TEACHINGS_EF = 'ATEssenceFont';

//
const FRAGILE_ECHO_SOURCE = 'FragileEchoSource';

const RAPID_DIFFUSION_BUFFER_MS = 300;
const DANCING_MIST_BUFFER_MS = 250;
const CAST_BUFFER_MS = 100;
const EF_BUFFER = 7000;
const MAX_MT_CHANNEL = 25000;
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
  {
    linkRelation: OVERHEAL_BOUNCE,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    additionalCondition(linkingEvent) {
      return (linkingEvent as HealEvent).overheal !== 0;
    },
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
    reverseLinkRelation: ENVELOPING_MIST_GOM,
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
    reverseLinkRelation: RENEWING_MIST_GOM,
    linkingEventId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: VIVIFY_GOM,
    reverseLinkRelation: VIVIFY_GOM,
    linkingEventId: SPELLS.VIVIFY.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: ZEN_PULSE_GOM,
    reverseLinkRelation: ZEN_PULSE_GOM,
    linkingEventId: TALENTS_MONK.ZEN_PULSE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: EXPEL_HARM_GOM,
    reverseLinkRelation: EXPEL_HARM_GOM,
    linkingEventId: SPELLS.EXPEL_HARM.id,
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: SOOM_GOM,
    reverseLinkRelation: SOOM_GOM,
    linkingEventId: TALENTS_MONK.SOOTHING_MIST_TALENT.id,
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: SHEILUNS_GIFT_GOM,
    reverseLinkRelation: SHEILUNS_GIFT_GOM,
    linkingEventId: TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
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
    reverseLinkRelation: REVIVAL_GOM,
    linkingEventId: [TALENTS_MONK.REVIVAL_TALENT.id, TALENTS_MONK.RESTORAL_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Cast, EventType.BeginChannel],
    referencedEventId: [SPELLS.INVIGORATING_MISTS_HEAL.id, SPELLS.VIVIFY.id],
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
  {
    linkRelation: MANA_TEA_CHANNEL,
    linkingEventId: SPELLS.MANA_TEA_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MANA_TEA_CAST.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MANA_TEA_CAST_LINK,
    reverseLinkRelation: MANA_TEA_CAST_LINK,
    linkingEventId: SPELLS.MANA_TEA_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MANA_TEA_BUFF.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MT_BUFF_REMOVAL,
    linkingEventId: SPELLS.MANA_TEA_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.MANA_TEA_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: MAX_MT_CHANNEL,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MT_STACK_CHANGE,
    linkingEventId: SPELLS.MANA_TEA_STACK.id,
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.MANA_TEA_STACK.id,
    referencedEventType: [EventType.RemoveBuffStack, EventType.ApplyBuffStack],
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: LIFECYCLES,
    reverseLinkRelation: LIFECYCLES,
    linkingEventId: [SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id, SPELLS.LIFECYCLES_VIVIFY_BUFF.id],
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.MANA_TEA_STACK.id,
    referencedEventType: [EventType.ApplyBuffStack, EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT);
    },
  },
  {
    linkRelation: ANCIENT_TEACHINGS_EF,
    reverseLinkRelation: ANCIENT_TEACHINGS_EF,
    linkingEventId: SPELLS.AT_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
    referencedEventType: EventType.EndChannel,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT);
    },
  },
  {
    linkRelation: ANCIENT_TEACHINGS_FLS,
    reverseLinkRelation: ANCIENT_TEACHINGS_FLS,
    linkingEventId: SPELLS.AT_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.JADEFIRE_STOMP_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT) &&
        c.hasTalent(TALENTS_MONK.JADEFIRE_STOMP_TALENT)
      );
    },
  },

  //items
  {
    linkRelation: FRAGILE_ECHO_SOURCE,
    reverseLinkRelation: FRAGILE_ECHO_SOURCE,
    linkingEventId: ITEMS.FRAGILE_ECHO.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      SPELLS.ENVELOPING_BREATH_HEAL.id,
      SPELLS.VIVIFY.id,
    ],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      const trinket = c.getTrinket(ITEMS.AMALGAMS_SEVENTH_SPINE.id);
      return trinket !== undefined;
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

export function isFromLifeCocoon(event: RemoveBuffEvent) {
  return HasRelatedEvent(event, CALMING_COALESCENCE);
}

export function getSheilunsGiftHits(event: CastEvent): HealEvent[] {
  return GetRelatedEvents<HealEvent>(event, SHEILUNS_GIFT);
}

export function getVivifiesPerCast(event: CastEvent) {
  return GetRelatedEvents(event, VIVIFY);
}

export function getNumberOfBolts(event: CastEvent) {
  return GetRelatedEvents(event, ESSENCE_FONT).length;
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

export function isATFromEssenceFont(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, ANCIENT_TEACHINGS_EF);
}

export function isATFromFaelineStomp(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, ANCIENT_TEACHINGS_FLS);
}

export function getFragileEchoSourceSpell(event: ApplyBuffEvent | RefreshBuffEvent): number {
  const sourceId = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent | HealEvent>(
    event,
    FRAGILE_ECHO_SOURCE,
  )?.ability.guid;
  return sourceId || -1;
}

export default CastLinkNormalizer;
