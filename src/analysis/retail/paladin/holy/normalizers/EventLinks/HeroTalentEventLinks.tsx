import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { AURORA_DIVINE_PURPOSE, BLESSED_ASSURANCE, SHORT_BUFFER_MS } from './EventLinkConstants';

const HERALD_OF_THE_SUN_EVENT_LINKS: EventLink[] = [
  // Attribute Divine Purpose proc to Aurora
  {
    linkRelation: AURORA_DIVINE_PURPOSE,
    linkingEventId: SPELLS.DIVINE_PURPOSE_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS.HOLY_PRISM_TALENT.id, TALENTS.DIVINE_TOLL_TALENT.id],
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    forwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS.AURORA_TALENT) && c.hasTalent(TALENTS.DIVINE_PURPOSE_SHARED_TALENT)
      );
    },
  },
];

const LIGHTSMITH_EVENT_LINKS: EventLink[] = [
  // Attribute Blessed Assurance buff removal to Crusader Strike
  {
    linkRelation: BLESSED_ASSURANCE,
    linkingEventId: SPELLS.BLESSED_ASSURANCE_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.CRUSADER_STRIKE.id,
    referencedEventType: EventType.Damage,
    maximumLinks: 1,
    forwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.BLESSED_ASSURANCE_TALENT);
    },
  },
];

export const HERO_TALENT_EVENT_LINKS: EventLink[] = [
  ...HERALD_OF_THE_SUN_EVENT_LINKS,
  ...LIGHTSMITH_EVENT_LINKS,
];
