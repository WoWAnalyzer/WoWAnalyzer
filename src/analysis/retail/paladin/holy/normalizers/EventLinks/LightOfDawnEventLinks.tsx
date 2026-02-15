import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  EMPYREAN_LEGACY,
  MED_BUFFER_MS,
  SHORT_BUFFER_MS,
  UNENDING_LIGHT,
} from './EventLinkConstants';

export const LIGHT_OF_DAWN_EVENT_LINKS: EventLink[] = [
  // Attribute Light of Dawn events to Empyrean Legacy being consumed
  {
    linkRelation: EMPYREAN_LEGACY,
    linkingEventId: SPELLS.EMPYREAN_LEGACY_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.LIGHT_OF_DAWN_HEAL.id,
    referencedEventType: EventType.Heal,
    maximumLinks: 5,
    forwardBufferMs: MED_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.EMPYREAN_LEGACY_HOLY_TALENT);
    },
  },
  // Attribute Light of Dawn to Unending Light Removal
  {
    linkRelation: UNENDING_LIGHT,
    linkingEventId: SPELLS.UNENDING_LIGHT_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.LIGHT_OF_DAWN_HEAL.id,
    referencedEventType: EventType.Heal,
    maximumLinks: 5,
    backwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNENDING_LIGHT_TALENT);
    },
  },
];
