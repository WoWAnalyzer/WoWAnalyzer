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
  EB_BUFFER_MS,
  CAST_BUFFER_MS,
  EMERALD_BLOSSOM_CAST,
  VERDANT_EMBRACE_BLOSSOM,
  DREAM_BREATH,
  MAX_DREAM_BREATH_DURATION,
  DREAM_BREATH_CAST,
  DREAM_BREATH_FROM_STASIS,
  STASIS_BUFFER,
  MERITHRAS_PROC_GENERATION,
  MERITHRAS_HEALING,
  MERITHRAS_BOUNCING_TIME,
} from './constants';

export const GREEN_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: EMERALD_BLOSSOM_CAST,
    linkingEventId: [SPELLS.EMERALD_BLOSSOM.id, SPELLS.FLUTTERING_SEEDLINGS_HEAL.id],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.EMERALD_BLOSSOM_CAST.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    reverseLinkRelation: EMERALD_BLOSSOM_CAST,
    backwardBufferMs: EB_BUFFER_MS + 150,
    additionalCondition(linkingEvent, referencedEvent) {
      return linkingEvent.timestamp - referencedEvent.timestamp > 1450;
    },
  },
  {
    linkRelation: VERDANT_EMBRACE_BLOSSOM,
    linkingEventId: [SPELLS.EMERALD_BLOSSOM.id, SPELLS.FLUTTERING_SEEDLINGS_HEAL.id],
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    maximumLinks: 1,
    backwardBufferMs: EB_BUFFER_MS + 150,
    additionalCondition(linkingEvent, referencedEvent) {
      return linkingEvent.timestamp - referencedEvent.timestamp > 1450;
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
    referencedEventType: [EventType.EmpowerEnd, EventType.Cast],
    reverseLinkRelation: DREAM_BREATH_CAST,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
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
    linkRelation: MERITHRAS_PROC_GENERATION,
    linkingEventId: SPELLS.MERITHRAS_BLESSING_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      TALENTS_EVOKER.ECHO_TALENT.id,
      SPELLS.EMERALD_BLOSSOM_CAST.id,
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      SPELLS.DREAM_BREATH_FONT.id,
    ],
    referencedEventType: [EventType.Cast, EventType.EmpowerEnd],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: MERITHRAS_HEALING,
    reverseLinkRelation: MERITHRAS_HEALING,
    linkingEventId: SPELLS.MERITHRAS_BLESSING_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MERITHRAS_BLESSING_CAST.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: MERITHRAS_BOUNCING_TIME,
    anyTarget: true,
  },
];
