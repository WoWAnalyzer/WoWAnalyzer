import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  VIVIFY,
  CAST_BUFFER_MS,
  ZEN_PULSE_VIVIFY,
  VIVACIOUS_VIVIFICATION,
} from './EventLinkConstants';
import { TALENTS_MONK } from 'common/TALENTS';

export const VIVIFY_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.INVIGORATING_MISTS_HEAL.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
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
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.VIVIFICATION_BUFF.id],
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    },
  },
];
