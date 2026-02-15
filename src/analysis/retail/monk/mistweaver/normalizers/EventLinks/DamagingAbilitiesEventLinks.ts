import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  CAST_BUFFER_MS,
  TIGER_PALM_CAST_LINK,
  BLACKOUT_KICK_CAST_LINK,
} from './EventLinkConstants';
import { WAY_OF_THE_CRANE_TP_STRIKES } from '../../constants';

export const DAMAGING_ABILITIES_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TIGER_PALM_CAST_LINK,
    linkingEventId: SPELLS.TIGER_PALM.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TIGER_PALM.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks(c) {
      return c.hasTalent(TALENTS_MONK.WAY_OF_THE_CRANE_TALENT) ? WAY_OF_THE_CRANE_TP_STRIKES : 1;
    },
  },
  {
    linkRelation: BLACKOUT_KICK_CAST_LINK,
    linkingEventId: SPELLS.BLACKOUT_KICK.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.BLACKOUT_KICK.id, SPELLS.BLACKOUT_KICK_TOTM.id],
    referencedEventType: EventType.Damage,
    forwardBufferMs: CAST_BUFFER_MS * 10, // additional boks are so uneven from the original cast
    anyTarget: true,
  },
];
