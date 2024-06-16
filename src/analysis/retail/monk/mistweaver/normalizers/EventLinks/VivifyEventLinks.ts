import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  VIVIFY,
  CAST_BUFFER_MS,
  ZEN_PULSE_VIVIFY,
  VIVACIOUS_VIVIFICATION,
  ZEN_PULSE_CONSUME,
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
    linkRelation: ZEN_PULSE_CONSUME,
    linkingEventId: SPELLS.ZEN_PULSE_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.VIVIFY.id,
    referencedEventType: [EventType.Cast],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
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
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    },
  },
];
