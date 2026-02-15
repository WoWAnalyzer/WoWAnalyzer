import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, HasRelatedEvent } from 'parser/core/Events';
import {
  AURORA_DIVINE_PURPOSE,
  BLESSED_ASSURANCE,
  BLESSING_OF_ANSHE,
  HOLY_SHOCK_SOURCE,
  LONG_BUFFER_MS,
  SECOND_SUNRISE,
  SHORT_BUFFER_MS,
} from './EventLinkConstants';

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
  // Attribute Holy Shock cast to Blessing of An'she consumption
  {
    linkRelation: BLESSING_OF_ANSHE,
    linkingEventId: SPELLS.BLESSING_OF_ANSHE_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [SPELLS.HOLY_SHOCK_DAMAGE.id, SPELLS.HOLY_SHOCK_HEAL.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    maximumLinks: 1,
    backwardBufferMs: SHORT_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.BLESSING_OF_ANSHE_TALENT);
    },
  },
  // Attribute heal from Holy Shock to Second Sunrise
  {
    linkRelation: SECOND_SUNRISE,
    reverseLinkRelation: HOLY_SHOCK_SOURCE,
    linkingEventId: SPELLS.SECOND_SUNRISE_HOLY_POWER.id,
    linkingEventType: EventType.ResourceChange,
    referencedEventId: [SPELLS.HOLY_SHOCK_HEAL.id, SPELLS.HOLY_SHOCK_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    maximumLinks: 1,
    backwardBufferMs: LONG_BUFFER_MS,
    forwardBufferMs: LONG_BUFFER_MS,
    anyTarget: true,
    additionalCondition(_, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, HOLY_SHOCK_SOURCE);
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
