import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, HasRelatedEvent } from 'parser/core/Events';
import {
  ESSENCE_BURST_LINK,
  MAX_ESSENCE_BURST_DURATION,
  EB_REVERSION,
  SPARK_OF_INSIGHT,
  FROM_HARDCAST,
  EB_BUFFER_MS,
} from './constants';

export const ESSENCE_BURST_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BURST_LINK,
    reverseLinkRelation: ESSENCE_BURST_LINK,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuffStack, EventType.ApplyBuff],
    referencedEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: MAX_ESSENCE_BURST_DURATION,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, ESSENCE_BURST_LINK);
    },
  },
  {
    linkRelation: EB_REVERSION,
    reverseLinkRelation: EB_REVERSION,
    linkingEventId: [TALENTS_EVOKER.REVERSION_TALENT.id, SPELLS.REVERSION_ECHO.id],
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    referencedEventType: [EventType.RefreshBuff, EventType.ApplyBuff, EventType.ApplyBuffStack],
    forwardBufferMs: 1500,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(linkingEvent, SPARK_OF_INSIGHT);
    },
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    referencedEventId: [
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.LIVING_FLAME_DAMAGE.id,
      SPELLS.LIVING_FLAME_CAST.id,
    ],
    referencedEventType: [EventType.Cast, EventType.Damage, EventType.Heal],
    backwardBufferMs: EB_BUFFER_MS, // very large delay between application and lf event sometimes
    forwardBufferMs: EB_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(linkingEvent, SPARK_OF_INSIGHT) &&
        !HasRelatedEvent(linkingEvent, EB_REVERSION)
      );
    },
  },
  {
    linkRelation: SPARK_OF_INSIGHT,
    reverseLinkRelation: SPARK_OF_INSIGHT,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.SPARK_OF_INSIGHT_TALENT);
    },
  },
];
