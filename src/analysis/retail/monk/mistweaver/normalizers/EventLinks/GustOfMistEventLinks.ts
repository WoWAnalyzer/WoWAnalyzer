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
  JFS_GOM,
  CRANE_STYLE_BOK,
  CRANE_STYLE_RSK,
  CRANE_STYLE_SCK,
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
    linkRelation: JFS_GOM,
    reverseLinkRelation: JFS_GOM,
    linkingEventId: TALENTS_MONK.JADEFIRE_STOMP_TALENT.id,
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: 500,
    anyTarget: true,
    maximumLinks: 5,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.JADEFIRE_STOMP_TALENT);
    },
  },
  {
    linkRelation: CRANE_STYLE_RSK,
    reverseLinkRelation: CRANE_STYLE_RSK,
    linkingEventId: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 2,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.CRANE_STYLE_TALENT);
    },
  },
  {
    linkRelation: CRANE_STYLE_BOK,
    reverseLinkRelation: CRANE_STYLE_BOK,
    linkingEventId: [SPELLS.BLACKOUT_KICK.id, SPELLS.BLACKOUT_KICK_TOTM.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: 250,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.CRANE_STYLE_TALENT);
    },
  },
  {
    linkRelation: CRANE_STYLE_SCK,
    reverseLinkRelation: CRANE_STYLE_SCK,
    linkingEventId: SPELLS.SPINNING_CRANE_KICK.id,
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.GUSTS_OF_MISTS.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: 250,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.CRANE_STYLE_TALENT);
    },
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
