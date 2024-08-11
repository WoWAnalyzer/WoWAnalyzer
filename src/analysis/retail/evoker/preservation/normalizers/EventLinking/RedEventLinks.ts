import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  ApplyBuffEvent,
  HealEvent,
  HasRelatedEvent,
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  DamageEvent,
} from 'parser/core/Events';
import { DUPLICATION_SPELLS } from '../../constants';
import {
  LIFEBIND,
  LIFEBIND_BUFFER,
  LIFEBIND_APPLY,
  CAST_BUFFER_MS,
  LIFEBIND_HEAL,
  ANCIENT_FLAME,
  ANCIENT_FLAME_CONSUME,
  LIFESPARK_LIVING_FLAME,
  LIVING_FLAME_FLIGHT_TIME,
  LIVING_FLAME_CALL_OF_YSERA,
  FIRE_BREATH,
  FIRE_BREATH_CAST,
  MAX_FIRE_BREATH_DURATION,
  ENGULF_DREAM_BREATH,
  MAX_DREAM_BREATH_DURATION,
  ENGULF_CONSUME_FLAME,
  ENGULF_CONSUME_BUFFER,
  LIFEBIND_HEAL_EMPOWER,
} from './constants';

export const RED_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: LIFEBIND,
    linkingEventId: SPELLS.LIFEBIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBIND_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: LIFEBIND_BUFFER,
  },
  {
    linkRelation: LIFEBIND_APPLY,
    reverseLinkRelation: LIFEBIND_APPLY,
    linkingEventId: SPELLS.LIFEBIND_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.VERDANT_EMBRACE_HEAL.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      // ve applies lifebind to player and target but there is no ve heal on player
      const applyEvent = linkingEvent as ApplyBuffEvent;
      return (
        applyEvent.targetID === (referencedEvent as HealEvent).targetID ||
        applyEvent.targetID === applyEvent.sourceID
      );
    },
  },
  {
    linkRelation: LIFEBIND_HEAL,
    linkingEventId: SPELLS.LIFEBIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: DUPLICATION_SPELLS,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    maximumLinks: 1,
    backwardBufferMs: 50,
    forwardBufferMs: 50,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, LIFEBIND); // make sure the heal is on someone with lifebind buff
    },
  },
  {
    linkRelation: LIFEBIND_HEAL_EMPOWER,
    reverseLinkRelation: LIFEBIND_HEAL_EMPOWER,
    linkingEventId: SPELLS.LIFEBIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.SPIRITBLOOM.id, SPELLS.SPIRITBLOOM_FONT.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: ANCIENT_FLAME,
    reverseLinkRelation: ANCIENT_FLAME,
    linkingEventId: [TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id, SPELLS.EMERALD_BLOSSOM_CAST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT);
    },
  },
  {
    linkRelation: ANCIENT_FLAME_CONSUME,
    reverseLinkRelation: ANCIENT_FLAME_CONSUME,
    linkingEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 1000 * 60 * 20, // has no duration so lets use safe upper bound on fight duration
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT);
    },
  },
  {
    linkRelation: LIFESPARK_LIVING_FLAME,
    linkingEventId: SPELLS.LIFESPARK_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.LIVING_FLAME_HEAL.id, SPELLS.LIVING_FLAME_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    forwardBufferMs: LIVING_FLAME_FLIGHT_TIME,
    anyTarget: true,
  },
  //link Call of Ysera Removal to Living Flame heal that consumed it
  {
    linkRelation: LIVING_FLAME_CALL_OF_YSERA,
    linkingEventId: SPELLS.LIVING_FLAME_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.CALL_OF_YSERA_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    backwardBufferMs: 1100,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    },
  },
  //Fire Breath
  {
    linkRelation: FIRE_BREATH,
    linkingEventId: SPELLS.FIRE_BREATH_DOT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.FIRE_BREATH_DOT.id,
    referencedEventType: [EventType.RefreshDebuff, EventType.ApplyDebuff],
    reverseLinkRelation: FIRE_BREATH,
    backwardBufferMs: MAX_FIRE_BREATH_DURATION,
    additionalCondition(linkingEvent, referencedEvent) {
      const linkDamageEvent = linkingEvent as DamageEvent;
      const refDebuffEvent =
        referencedEvent.type === EventType.RefreshDebuff
          ? (referencedEvent as RefreshDebuffEvent)
          : (referencedEvent as ApplyDebuffEvent);
      return (
        linkDamageEvent.ability.guid === refDebuffEvent.ability.guid &&
        !HasRelatedEvent(linkingEvent, FIRE_BREATH)
      );
    },
  },
  {
    linkRelation: FIRE_BREATH_CAST,
    linkingEventId: SPELLS.FIRE_BREATH_DOT.id,
    linkingEventType: [EventType.RefreshDebuff, EventType.ApplyDebuff],
    referencedEventId: [SPELLS.FIRE_BREATH.id, SPELLS.FIRE_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  //Engulf
  {
    linkRelation: ENGULF_DREAM_BREATH,
    linkingEventId: SPELLS.ENGULF_HEAL.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_DREAM_BREATH_DURATION,
    maximumLinks: 1,
  },
  {
    linkRelation: ENGULF_CONSUME_FLAME,
    linkingEventId: SPELLS.ENGULF_HEAL.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.CONSUME_FLAME_HEAL.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: ENGULF_CONSUME_BUFFER,
    backwardBufferMs: ENGULF_CONSUME_BUFFER,
    reverseLinkRelation: ENGULF_CONSUME_FLAME,
    anyTarget: true,
  },
];
