import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import {
  CAST_BUFFER_MS,
  EVENT_LINKS,
} from '../constants';

/*
  This file is for linking the various events to the unleash life buff
  It is needed because the buff can be removed in multiple different ways and links to many different events
*/

const unleashLifeEventLink: EventLink = {  //Unleash life linkings
    linkRelation: EVENT_LINKS.unleashLifeCast,
    linkingEventId: [TALENTS.UNLEASH_LIFE_TALENT.id],
    linkingEventType: [EventType.Cast],
    reverseLinkRelation: EVENT_LINKS.unleashLifeHeal,
    referencedEventId: [TALENTS.UNLEASH_LIFE_TALENT.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    },
}

const unleashLifeBuffRemoveEventLink: EventLink = {  //Unleash life linkings
    linkRelation: EVENT_LINKS.unleashLifeBuffRemove,
    linkingEventId: [TALENTS.UNLEASH_LIFE_TALENT.id],
    linkingEventType: [EventType.RemoveBuff],
    reverseLinkRelation: EVENT_LINKS.unleashLifeBuffedCast,
    referencedEventId: [
      TALENTS.RIPTIDE_TALENT.id,
      SPELLS.HEALING_WAVE.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    },
}

const unleashLifeBuffedRiptideEventLink: EventLink = { //Needs a Rework for Riptide heals because the cast > removeBuff > Heal/HOT
    linkRelation: EVENT_LINKS.unleashLifeBuffedRiptideCast,
    linkingEventId: [TALENTS.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.Cast],
    reverseLinkRelation: EVENT_LINKS.unleashLifeBuffedRiptideHeal,
    referencedEventId: [TALENTS.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.Heal, EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: 255,
    forwardBufferMs: 255,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, EVENT_LINKS.unleashLifeBuffedCast) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid &&
        (linkingEvent as CastEvent).targetID === (referencedEvent as HealEvent).targetID
      );
    },
}

const unleashLifeBuffedHealingWaveEventLink: EventLink = {
    linkRelation: EVENT_LINKS.unleashLifeBuffedHealingWaveCast,
    linkingEventId: [SPELLS.HEALING_WAVE.id],
    linkingEventType: [EventType.Cast],
    reverseLinkRelation: EVENT_LINKS.unleashLifeBuffedHealingWaveHeal,
    referencedEventId: [SPELLS.HEALING_WAVE.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 1100,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, EVENT_LINKS.unleashLifeBuffedCast) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid &&
        (linkingEvent as CastEvent).targetID === (referencedEvent as HealEvent).targetID
      );
    },
}

const unleashLifeBuffedChainHealEventLink: EventLink = {
    linkRelation: EVENT_LINKS.unleashLifeBuffedChainHealCast,
    linkingEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    linkingEventType: [EventType.Cast],
    reverseLinkRelation: EVENT_LINKS.unleashLifeBuffedChainHealHeal,
    referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 255,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, EVENT_LINKS.unleashLifeBuffedCast) &&
        (linkingEvent as HealEvent).ability.guid === (referencedEvent as CastEvent).ability.guid &&
        (linkingEvent as CastEvent).targetID === (referencedEvent as HealEvent).targetID
      ); //Might not work that way depending on the CH implementations and other Event_Links.
    },
}

class UnleashLifeNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      unleashLifeEventLink,
      unleashLifeBuffRemoveEventLink,
      unleashLifeBuffedRiptideEventLink,
      unleashLifeBuffedHealingWaveEventLink,
      unleashLifeBuffedChainHealEventLink,
  ]);
  }
}

export function getCastEvent(event: HealEvent): CastEvent {
  return GetRelatedEvent(event, EVENT_LINKS.unleashLifeCast)!;
}

export function wasUnleashLifeConsumed(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, EVENT_LINKS.unleashLifeBuffRemove);
}

export function isBuffedByUnleashLife( //Needs a Rework for Riptide heals because the cast > removeBuff > Heal/HOT
  event: CastEvent | HealEvent | ApplyBuffEvent | RefreshBuffEvent,
): boolean {
  return (
    HasRelatedEvent(event, EVENT_LINKS.unleashLifeBuffedCast) ||
    HasRelatedEvent(event, EVENT_LINKS.unleashLifeBuffedRiptideHeal) ||
    HasRelatedEvent(event, EVENT_LINKS.unleashLifeBuffedHealingWaveHeal) ||
    HasRelatedEvent(event, EVENT_LINKS.unleashLifeBuffedChainHealHeal)
  );
}


export function getUnleashLifeHealingWaves(event: CastEvent | HealEvent) {
    return GetRelatedEvents(event, EVENT_LINKS.unleashLifeBuffedHealingWaveCast) as HealEvent[];
  }

export default UnleashLifeNormalizer;
