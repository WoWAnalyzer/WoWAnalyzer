import { EventLink } from 'parser/core/EventLinkNormalizer';
import { CAST_BUFFER_MS, T32_2PC, T32_4PC } from './constants';
import SPELLS from 'common/SPELLS';
import { EventType, HasRelatedEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';

export const TIER_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: T32_2PC,
    reverseLinkRelation: T32_2PC,
    linkingEventId: [
      SPELLS.REVERSION_ECHO.id,
      TALENTS_EVOKER.REVERSION_TALENT.id,
      SPELLS.EMERALD_BLOSSOM.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
    ],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.EPOCH_FRAGMENT.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS * 5,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, refEvent) {
      return !HasRelatedEvent(refEvent, T32_2PC);
    },
  },
  {
    linkRelation: T32_4PC,
    reverseLinkRelation: T32_4PC,
    linkingEventId: SPELLS.T32_4PC_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.REVERSION_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: 5,
    backwardBufferMs: 5,
    maximumLinks: 1,
  },
];
