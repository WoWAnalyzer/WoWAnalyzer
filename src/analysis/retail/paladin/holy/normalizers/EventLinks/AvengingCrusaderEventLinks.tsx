import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { AC_CRUSADER_STRIKE, AC_JUDGMENT, SHORT_BUFFER_MS } from './EventLinkConstants';

export const AVENGING_CRUSADER_EVENT_LINKS: EventLink[] = [
  // attribute avenging wrath heals to crusader strike
  {
    linkRelation: AC_CRUSADER_STRIKE,
    linkingEventId: SPELLS.CRUSADER_STRIKE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: [
      SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id,
      SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id,
    ],
    referencedEventType: EventType.Heal,
    maximumLinks: 5,
    forwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);
    },
  },
  // attribute avenging wrath heals to judgment
  {
    linkRelation: AC_JUDGMENT,
    linkingEventId: SPELLS.JUDGMENT_CAST_HOLY.id,
    linkingEventType: EventType.Damage,
    referencedEventId: [
      SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id,
      SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id,
    ],
    referencedEventType: EventType.Heal,
    maximumLinks: 5,
    forwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);
    },
  },
];
