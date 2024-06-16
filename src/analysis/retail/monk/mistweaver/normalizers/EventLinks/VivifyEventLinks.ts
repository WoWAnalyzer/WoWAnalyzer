import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { VIVIFY, CAST_BUFFER_MS } from './EventLinkConstants';

export const VIVIFY_EVENT_LINKS: EventLink[] = [
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
  //zen pulse
  //vivacious vivification
];
