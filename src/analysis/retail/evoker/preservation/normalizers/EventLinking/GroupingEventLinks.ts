import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  AbilityEvent,
  HealEvent,
  ApplyBuffEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import {
  HEAL_GROUPING,
  ECHO,
  ECHO_TEMPORAL_ANOMALY,
  BUFF_GROUPING,
  CAST_BUFFER_MS,
  ECHO_HEAL_GROUPING,
} from './constants';

export const GROUPING_EVENT_LINKS: EventLink[] = [
  // group TA shields and EB heals together for easy batch processing
  {
    linkRelation: HEAL_GROUPING,
    linkingEventId: [
      SPELLS.EMERALD_BLOSSOM.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
    ],
    linkingEventType: [EventType.Heal, EventType.ApplyBuff],
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
    ],
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 25,
    backwardBufferMs: 25,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        (linkingEvent as AbilityEvent<any>).ability.guid !==
        (referencedEvent as AbilityEvent<any>).ability.guid
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.Heal &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as HealEvent).targetID
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.ApplyBuff &&
        (linkingEvent as ApplyBuffEvent).targetID === (referencedEvent as ApplyBuffEvent).targetID
      ) {
        return false;
      }
      return (
        !HasRelatedEvent(linkingEvent, ECHO) &&
        !HasRelatedEvent(linkingEvent, ECHO_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(referencedEvent, ECHO) &&
        !HasRelatedEvent(referencedEvent, ECHO_TEMPORAL_ANOMALY)
      );
    },
  },
  // link dream breath applications together
  {
    linkRelation: BUFF_GROUPING,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_FONT.id],
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !== (referencedEvent as ApplyBuffEvent).targetID
      );
    },
  },
  // group echo heals together
  {
    linkRelation: ECHO_HEAL_GROUPING,
    linkingEventId: [SPELLS.EMERALD_BLOSSOM_ECHO.id, SPELLS.SPIRITBLOOM_SPLIT.id],
    linkingEventType: [EventType.Heal, EventType.ApplyBuff],
    referencedEventId: [SPELLS.EMERALD_BLOSSOM_ECHO.id, SPELLS.SPIRITBLOOM_SPLIT.id],
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 25,
    backwardBufferMs: 25,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        (linkingEvent as AbilityEvent<any>).ability.guid !==
        (referencedEvent as AbilityEvent<any>).ability.guid
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.Heal &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as HealEvent).targetID
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.ApplyBuff &&
        (linkingEvent as ApplyBuffEvent).targetID === (referencedEvent as ApplyBuffEvent).targetID
      ) {
        return false;
      }
      return true;
    },
  },
];
