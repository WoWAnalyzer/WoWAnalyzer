import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  VIVIFY,
  CAST_BUFFER_MS,
  ZEN_PULSE_CAST,
  VIVACIOUS_VIVIFICATION,
  ZEN_PULSE_CONSUME,
  ZEN_PULSE_OVERCAP,
  SHEILUNS_GIFT_MAIN_TARGET,
  SHEILUNS_GIFT,
} from './EventLinkConstants';
import { TALENTS_MONK } from 'common/TALENTS';
import { THUNDER_FOCUS_TEA_SPELLS } from '../../constants';

export const VIVIFY_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VIVIFY,
    linkingEventId: [SPELLS.VIVIFY.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.INVIGORATING_MISTS_HEAL.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 50,
    forwardBufferMs: 50,
    anyTarget: true,
  },
  {
    linkRelation: ZEN_PULSE_CAST,
    linkingEventId: [SPELLS.VIVIFY.id, TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.ZEN_PULSE_HEAL.id],
    referencedEventType: [EventType.Heal],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: ZEN_PULSE_CONSUME,
    reverseLinkRelation: ZEN_PULSE_CONSUME,
    linkingEventId: SPELLS.ZEN_PULSE_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.VIVIFY.id,
    referencedEventType: [EventType.Cast],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: ZEN_PULSE_OVERCAP,
    reverseLinkRelation: ZEN_PULSE_OVERCAP,
    linkingEventId: SPELLS.ZEN_PULSE_BUFF.id,
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: THUNDER_FOCUS_TEA_SPELLS.map((spell) => spell.id),
    referencedEventType: [EventType.Cast],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    },
  },
  {
    linkRelation: VIVACIOUS_VIVIFICATION,
    linkingEventId: SPELLS.VIVIFY.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.VIVIFICATION_BUFF.id],
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    },
  },
  {
    linkRelation: SHEILUNS_GIFT,
    linkingEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    },
    maximumLinks(c) {
      return c.hasTalent(TALENTS_MONK.LEGACY_OF_WISDOM_TALENT) ? 5 : 3;
    },
  },
  {
    linkRelation: SHEILUNS_GIFT_MAIN_TARGET,
    linkingEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    linkingEventType: [EventType.Cast],
    referencedEventId: [TALENTS_MONK.SHEILUNS_GIFT_TALENT.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: false,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    },
  },
];
