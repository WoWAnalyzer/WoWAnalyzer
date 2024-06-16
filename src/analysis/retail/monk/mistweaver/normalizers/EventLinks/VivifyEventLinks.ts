import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, HasRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import {
  VIVIFY,
  CAST_BUFFER_MS,
  ZEN_PULSE_VIVIFY,
  VIVACIOUS_VIVIFICATION,
  VIVACIOUS_VIVIFICATION_CAST,
} from './EventLinkConstants';
import { TALENTS_MONK } from 'common/TALENTS';

export const VIVIFY_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.INVIGORATING_MISTS_HEAL.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 50,
    forwardBufferMs: 50,
    anyTarget: true,
  },
  {
    linkRelation: ZEN_PULSE_VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.ZEN_PULSE_HEAL.id],
    referencedEventType: [EventType.Heal],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: VIVACIOUS_VIVIFICATION,
    linkingEventId: SPELLS.VIVIFY.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.VIVIFICATION_BUFF.id],
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, VIVACIOUS_VIVIFICATION_CAST);
    },
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    },
  },
  {
    linkRelation: VIVACIOUS_VIVIFICATION_CAST,
    linkingEventId: SPELLS.VIVIFICATION_BUFF.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: SPELLS.VIVIFY.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    maximumLinks: 1,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return (linkingEvent as RemoveBuffEvent).sourceID === (referencedEvent as CastEvent).sourceID;
    },
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    },
  },
];
