import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { CAST_BUFFER_MS, STRENGTH_OF_THE_BLACK_OX } from './EventLinkConstants';

export const HERO_TALENT_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: STRENGTH_OF_THE_BLACK_OX,
    linkingEventId: SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [SPELLS.ENVELOPING_MIST_TFT.id, TALENTS_MONK.ENVELOPING_MIST_TALENT.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT);
    },
  },
];
