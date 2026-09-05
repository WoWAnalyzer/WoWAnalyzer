import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  CAST_BUFFER_MS,
  SPIRITFONT_PROC,
  SPIRITFONT_TFT,
  SPIRITFONT_CONSUMED,
  SPIRITFONT_FALSE_REFRESH,
  SPIRITFONT_OVERCAP,
} from './EventLinkConstants';

export const APEX_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SPIRITFONT_PROC,
    linkingEventId: SPELLS.SPIRITFONT_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: [
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
      TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT.id,
      SPELLS.VIVIFY.id,
      TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT);
    },
  },
  {
    linkRelation: SPIRITFONT_TFT,
    linkingEventId: SPELLS.SPIRITFONT_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SPIRITFONT_3_MISTWEAVER_TALENT);
    },
  },
  {
    linkRelation: SPIRITFONT_CONSUMED,
    reverseLinkRelation: SPIRITFONT_CONSUMED,
    linkingEventId: SPELLS.SPIRITFONT_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT);
    },
  },
  {
    linkRelation: SPIRITFONT_OVERCAP,
    reverseLinkRelation: SPIRITFONT_OVERCAP,
    linkingEventId: SPELLS.SPIRITFONT_BUFF.id,
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SPIRITFONT_3_MISTWEAVER_TALENT);
    },
  },
  {
    linkRelation: SPIRITFONT_FALSE_REFRESH,
    linkingEventId: SPELLS.SPIRITFONT_BUFF.id,
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.SPIRITFONT_BUFF.id,
    referencedEventType: EventType.RemoveBuffStack,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT);
    },
  },
];
