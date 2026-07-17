import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  INFUSION_OF_LIGHT_CONSUME,
  INFUSION_OF_LIGHT_CONSUME_BUFFER_MS,
} from './EventLinkConstants';

export const INFUSION_OF_LIGHT_EVENT_LINKS: EventLink[] = [
  // Attribute a charge leaving the buff to the cast that spent it. A removal with no
  // linked cast is a proc that expired rather than one that was used.
  {
    linkRelation: INFUSION_OF_LIGHT_CONSUME,
    // So a cast can also ask whether it spent a charge, not just the other way round.
    reverseLinkRelation: INFUSION_OF_LIGHT_CONSUME,
    linkingEventId: SPELLS.INFUSION_OF_LIGHT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.FLASH_OF_LIGHT.id, SPELLS.JUDGMENT_CAST_HOLY.id],
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    backwardBufferMs: INFUSION_OF_LIGHT_CONSUME_BUFFER_MS,
    forwardBufferMs: INFUSION_OF_LIGHT_CONSUME_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.INFUSION_OF_LIGHT_TALENT);
    },
  },
];
