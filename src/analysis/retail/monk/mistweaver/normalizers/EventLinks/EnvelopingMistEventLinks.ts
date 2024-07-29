import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, HasRelatedEvent } from 'parser/core/Events';
import {
  FROM_MISTY_PEAKS,
  FROM_HARDCAST,
  APPLIED_HEAL,
  CAST_BUFFER_MS,
  TFT_ENV_TOM,
} from './EventLinkConstants';

export const ENVELOPING_MIST_EVENT_LINKS: EventLink[] = [
  // misty peaks proc from a ReM hot event
  {
    linkRelation: FROM_MISTY_PEAKS,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id],
    linkingEventType: [EventType.ApplyBuff],
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
  //TFT Enveloping Mist - Tear Of Morning Cleave Link
  {
    linkRelation: TFT_ENV_TOM,
    linkingEventId: [TALENTS_MONK.ENVELOPING_MIST_TALENT.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [SPELLS.ENVELOPING_MIST_TFT.id],
    referencedEventType: [EventType.Heal],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT);
    },
  },
];
