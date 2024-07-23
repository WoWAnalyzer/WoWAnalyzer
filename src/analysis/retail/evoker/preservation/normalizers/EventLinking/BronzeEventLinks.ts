import { EMPOWERED_CAST } from 'analysis/retail/evoker/shared/modules/normalizers/EmpowerNormalizer';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  CastEvent,
  HasRelatedEvent,
  SummonEvent,
  HealEvent,
  RefreshBuffEvent,
  ApplyBuffEvent,
} from 'parser/core/Events';
import { STASIS_CAST_IDS } from '../../constants';
import {
  STASIS,
  STASIS_BUFFER,
  STASIS_FOR_RAMP,
  MAX_ECHO_DURATION,
  GOLDEN_HOUR,
  ECHO_BUFFER,
  TIME_OF_NEED_HEALING,
  TIME_OF_NEED_DURATION,
  REVERSION,
  MAX_REVERSION_DURATION,
  STASIS_FILLING,
  FULL_STASIS_DURATION,
  TEMPORAL_COMPRESSION_REVERSION,
} from './constants';

export const BRONZE_EVENT_LINKS: EventLink[] = [
  // stasis stack removal to cast
  {
    linkRelation: STASIS,
    reverseLinkRelation: STASIS,
    linkingEventId: TALENTS_EVOKER.STASIS_TALENT.id,
    linkingEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    referencedEventId: STASIS_CAST_IDS,
    referencedEventType: EventType.Cast,
    backwardBufferMs: STASIS_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      const refEvent = referencedEvent as CastEvent;
      // need to ignore living flame casts on enemy
      if (
        refEvent.target &&
        !refEvent.targetIsFriendly &&
        (!refEvent.target || refEvent.target.guid !== 0)
      ) {
        return false;
      }
      return (
        !HasRelatedEvent(referencedEvent, EMPOWERED_CAST) &&
        !HasRelatedEvent(referencedEvent, STASIS)
      );
    },
  },
  {
    linkRelation: STASIS,
    reverseLinkRelation: STASIS,
    linkingEventId: TALENTS_EVOKER.STASIS_TALENT.id,
    linkingEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    referencedEventId: [
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      SPELLS.DREAM_BREATH_FONT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
    ],
    referencedEventType: EventType.EmpowerEnd,
    backwardBufferMs: STASIS_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(referencedEvent, EMPOWERED_CAST) &&
        !HasRelatedEvent(referencedEvent, STASIS)
      );
    },
  },
  {
    linkRelation: STASIS_FILLING,
    reverseLinkRelation: STASIS_FILLING,
    linkingEventId: SPELLS.STASIS_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.STASIS_TALENT.id,
    referencedEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    backwardBufferMs: FULL_STASIS_DURATION,
    anyTarget: true,
  },
  {
    linkRelation: STASIS_FOR_RAMP,
    linkingEventId: SPELLS.STASIS_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: MAX_ECHO_DURATION + 3000,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.STASIS_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  {
    linkRelation: GOLDEN_HOUR,
    linkingEventId: SPELLS.GOLDEN_HOUR_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [TALENTS_EVOKER.REVERSION_TALENT.id, SPELLS.REVERSION_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: ECHO_BUFFER,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
  },
  {
    linkRelation: TIME_OF_NEED_HEALING,
    linkingEventId: SPELLS.TIME_OF_NEED_SUMMON.id,
    linkingEventType: EventType.Summon,
    referencedEventId: [SPELLS.VERDANT_EMBRACE_HEAL.id, SPELLS.TIME_OF_NEED_LIVING_FLAME.id],
    referencedEventType: EventType.Heal,
    forwardBufferMs: TIME_OF_NEED_DURATION,
    anySource: true,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return (linkingEvent as SummonEvent).targetID === (referencedEvent as HealEvent).sourceID;
    },
  },
  {
    linkRelation: REVERSION,
    linkingEventId: [TALENTS_EVOKER.REVERSION_TALENT.id, SPELLS.REVERSION_ECHO.id],
    linkingEventType: EventType.Heal,
    referencedEventId: [TALENTS_EVOKER.REVERSION_TALENT.id, SPELLS.REVERSION_ECHO.id],
    referencedEventType: [EventType.RefreshBuff, EventType.ApplyBuff],
    reverseLinkRelation: REVERSION,
    backwardBufferMs: MAX_REVERSION_DURATION,
    additionalCondition(linkingEvent, referencedEvent) {
      const linkHealEvent = linkingEvent as HealEvent;
      const refBuffEvent =
        referencedEvent.type === EventType.RefreshBuff
          ? (referencedEvent as RefreshBuffEvent)
          : (referencedEvent as ApplyBuffEvent);
      return (
        linkHealEvent.ability.guid === refBuffEvent.ability.guid &&
        !HasRelatedEvent(linkingEvent, REVERSION)
      );
    },
  },
  {
    linkRelation: TEMPORAL_COMPRESSION_REVERSION,
    reverseLinkRelation: TEMPORAL_COMPRESSION_REVERSION,
    linkingEventId: SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: TALENTS_EVOKER.REVERSION_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
  },
];
