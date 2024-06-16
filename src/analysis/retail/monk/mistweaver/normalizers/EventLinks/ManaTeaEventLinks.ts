import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  MANA_TEA_CHANNEL,
  MAX_MT_CHANNEL,
  MANA_TEA_CAST_LINK,
  MT_BUFF_REMOVAL,
  MT_STACK_CHANGE,
  LIFECYCLES,
} from './EventLinkConstants';

export const MANA_TEA_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: MANA_TEA_CHANNEL,
    linkingEventId: SPELLS.MANA_TEA_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MANA_TEA_CAST.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MANA_TEA_CAST_LINK,
    reverseLinkRelation: MANA_TEA_CAST_LINK,
    linkingEventId: SPELLS.MANA_TEA_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MANA_TEA_BUFF.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MT_BUFF_REMOVAL,
    linkingEventId: SPELLS.MANA_TEA_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.MANA_TEA_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: MAX_MT_CHANNEL,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: MT_STACK_CHANGE,
    linkingEventId: SPELLS.MANA_TEA_STACK.id,
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.MANA_TEA_STACK.id,
    referencedEventType: [EventType.RemoveBuffStack, EventType.ApplyBuffStack],
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    },
  },
  {
    linkRelation: LIFECYCLES,
    reverseLinkRelation: LIFECYCLES,
    linkingEventId: [SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id, SPELLS.LIFECYCLES_VIVIFY_BUFF.id],
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.MANA_TEA_STACK.id,
    referencedEventType: [EventType.ApplyBuffStack, EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: MAX_MT_CHANNEL,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT);
    },
  },
];
