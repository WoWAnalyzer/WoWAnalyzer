import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  HealEvent,
  RefreshBuffEvent,
  ApplyBuffEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import {
  FIELD_OF_DREAMS_PROC,
  EB_BUFFER_MS,
  EB_VARIANCE_BUFFER,
  DREAM_BREATH_CALL_OF_YSERA_HOT,
  CAST_BUFFER_MS,
  DREAM_BREATH_CALL_OF_YSERA,
  EMERALD_BLOSSOM_CAST,
  DREAM_BREATH,
  MAX_DREAM_BREATH_DURATION,
  DREAM_BREATH_CAST,
  DREAM_BREATH_FROM_STASIS,
  STASIS_BUFFER,
  SPIRITBLOOM_CAST,
  SPIRITBLOOM_HOT_DURATION,
  SPIRITBLOOM_FROM_STASIS,
} from './constants';

export const GREEN_EVENT_LINKS: EventLink[] = [
  // link eb heal proc to fluttering heal
  {
    linkRelation: FIELD_OF_DREAMS_PROC,
    linkingEventId: SPELLS.EMERALD_BLOSSOM.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    backwardBufferMs: EB_BUFFER_MS + 500,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      const diff = EB_BUFFER_MS - (linkingEvent.timestamp - referencedEvent.timestamp);
      return Math.abs(diff) < EB_VARIANCE_BUFFER;
    },
  },
  //link Call of Ysera Removal to the heals
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA_HOT,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.Heal],
    referencedEventId: [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Dream Breath cast that consumed it
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA,
    linkingEventId: SPELLS.CALL_OF_YSERA_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    maximumLinks: 1,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  {
    linkRelation: EMERALD_BLOSSOM_CAST,
    linkingEventId: SPELLS.EMERALD_BLOSSOM.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.EMERALD_BLOSSOM_CAST.id,
    referencedEventType: EventType.Cast,
    maximumLinks: 1,
    backwardBufferMs: EB_BUFFER_MS + 150,
    additionalCondition(linkingEvent, referencedEvent) {
      return linkingEvent.timestamp - referencedEvent.timestamp > 1500;
    },
  },
  {
    linkRelation: DREAM_BREATH,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.RefreshBuff, EventType.ApplyBuff],
    reverseLinkRelation: DREAM_BREATH,
    backwardBufferMs: MAX_DREAM_BREATH_DURATION,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      const linkHealEvent = linkingEvent as HealEvent;
      const refBuffEvent =
        referencedEvent.type === EventType.RefreshBuff
          ? (referencedEvent as RefreshBuffEvent)
          : (referencedEvent as ApplyBuffEvent);
      return (
        linkHealEvent.ability.guid === refBuffEvent.ability.guid &&
        !HasRelatedEvent(linkingEvent, DREAM_BREATH)
      );
    },
  },
  {
    linkRelation: DREAM_BREATH_CAST,
    linkingEventId: [
      SPELLS.DREAM_BREATH.id,
      SPELLS.DREAM_BREATH_FONT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    reverseLinkRelation: DREAM_BREATH_CAST,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
  },
  {
    linkRelation: DREAM_BREATH_FROM_STASIS,
    linkingEventId: [
      SPELLS.DREAM_BREATH.id,
      SPELLS.DREAM_BREATH_FONT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.STASIS_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    backwardBufferMs: STASIS_BUFFER,
    maximumLinks: 1,
    anyTarget: true,
  },
  {
    linkRelation: SPIRITBLOOM_CAST,
    linkingEventId: [SPELLS.SPIRITBLOOM.id, SPELLS.SPIRITBLOOM_FONT.id, SPELLS.SPIRITBLOOM_HOT.id],
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.SPIRITBLOOM.id, SPELLS.SPIRITBLOOM_FONT.id],
    referencedEventType: [EventType.EmpowerEnd, EventType.Cast],
    reverseLinkRelation: SPIRITBLOOM_CAST,
    backwardBufferMs: SPIRITBLOOM_HOT_DURATION,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: SPIRITBLOOM_FROM_STASIS,
    reverseLinkRelation: SPIRITBLOOM_FROM_STASIS,
    linkingEventId: [SPELLS.SPIRITBLOOM.id, SPELLS.SPIRITBLOOM_FONT.id, SPELLS.SPIRITBLOOM_HOT.id],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.STASIS_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    backwardBufferMs: STASIS_BUFFER + SPIRITBLOOM_HOT_DURATION,
    maximumLinks: 1,
    anyTarget: true,
  },
];
