import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AnyEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import {
  EVENT_LINKS,
  MASTER_OF_THE_ELEMENTS_SPELL_WHITELIST,
  NORMALIZER_ORDER,
} from '../../constants';

// stormkeeper applybuff -> stormkeeper begincast
const stormkeeperEventLink: EventLink = {
  linkRelation: EVENT_LINKS.Stormkeeper,
  linkingEventId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
  linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
  referencedEventId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
  referencedEventType: EventType.BeginCast,
  forwardBufferMs: -1,
  backwardBufferMs: 2000,
  anySource: true,
  anyTarget: true,
  maximumLinks: 1,
  isActive: (c) => c.hasTalent(TALENTS.STORMKEEPER_TALENT),
};

// call of the ancestors summon -> ancestral swiftness cast
const callOfTheAncestorsEventLink: EventLink = {
  linkRelation: EVENT_LINKS.CallOfTheAncestors,
  linkingEventId: SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.id,
  linkingEventType: EventType.Summon,
  referencedEventId: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: -1, // only look backwards
  backwardBufferMs: 5,
  anySource: true,
  anyTarget: true,
  maximumLinks: 1,
  isActive: (c) => c.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT),
  additionalCondition: (le: AnyEvent, re: AnyEvent) =>
    GetRelatedEvents(re, EVENT_LINKS.CallOfTheAncestors).length === 0,
};

// lava burst cast -> master of the elements applybuff/refreshbuff
const masterOfTheElementsBuffEventLink: EventLink = {
  linkRelation: EVENT_LINKS.MasterOfTheElementsBuff,
  linkingEventId: TALENTS.LAVA_BURST_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
  referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
  forwardBufferMs: 30,
  backwardBufferMs: 10,
  anyTarget: true,
  maximumLinks: 1,
  isActive: (c) => c.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT),
};

// master of the elements applybuff/refreshbuff -> first whitelist spell cast
const masterOfTheElementsConsumeEventLink: EventLink = {
  linkRelation: EVENT_LINKS.MasterOfTheElementsConsume,
  linkingEventId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
  linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
  referencedEventId: MASTER_OF_THE_ELEMENTS_SPELL_WHITELIST.map((spell) => spell.id),
  referencedEventType: EventType.Cast,
  forwardBufferMs: 15_100, // slightly longer than 15s buff duration
  backwardBufferMs: -1, // only look forward
  anyTarget: true,
  maximumLinks: 1,
  reverseLinkRelation: EVENT_LINKS.MasterOfTheElementsConsume,
  isActive: (c) => c.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT),
  additionalCondition: (le: AnyEvent, re: AnyEvent) =>
    GetRelatedEvents(re, EVENT_LINKS.MasterOfTheElementsConsume).length === 0,
};

// voltaic blaze cast -> voltaic blaze damage
const voltaicBlazeDamageEventLink: EventLink = {
  linkRelation: EVENT_LINKS.VoltaicBlazeDamage,
  linkingEventId: SPELLS.VOLTAIC_BLAZE_CAST.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.VOLTAIC_BLAZE_DAMAGE.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 20,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.PURGING_FLAMES_TALENT),
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      stormkeeperEventLink,
      callOfTheAncestorsEventLink,
      masterOfTheElementsBuffEventLink,
      masterOfTheElementsConsumeEventLink,
      voltaicBlazeDamageEventLink,
    ]);
    this.priority = NORMALIZER_ORDER.EventLink;
  }
}

export default EventLinkNormalizer;
