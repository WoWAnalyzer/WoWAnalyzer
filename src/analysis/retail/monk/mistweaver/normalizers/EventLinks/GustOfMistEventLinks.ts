import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  ENVELOPING_MIST_GOM,
  CAST_BUFFER_MS,
  RENEWING_MIST_GOM,
  VIVIFY_GOM,
  EXPEL_HARM_GOM,
  SOOM_GOM,
  SHEILUNS_GIFT_GOM,
  REVIVAL_GOM,
} from './EventLinkConstants';

export const GUST_OF_MISTS_EVENT_LINKS: EventLink[] = [
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
];
