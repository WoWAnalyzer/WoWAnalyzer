import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  ApplyBuffEvent,
  RemoveBuffEvent,
  HealEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import {
  FROM_HARDCAST,
  APPLIED_HEAL,
  CAST_BUFFER_MS,
  FORCE_BOUNCE,
  BOUNCED,
  MAX_REM_DURATION,
  OVERHEAL_BOUNCE,
  FROM_RAPID_DIFFUSION,
  RAPID_DIFFUSION_BUFFER_MS,
  FROM_DANCING_MISTS,
  SOURCE_APPLY,
  DANCING_MIST_BUFFER_MS,
  FROM_MISTS_OF_LIFE,
} from './EventLinkConstants';

export const RENEWING_MIST_EVENT_LINKS: EventLink[] = [
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
];
