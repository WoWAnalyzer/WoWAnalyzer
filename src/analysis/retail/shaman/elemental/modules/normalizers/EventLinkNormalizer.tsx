import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { AnyEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { EVENT_LINKS, NORMALIZER_ORDER } from '../../constants';

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      // stormkeeper applybuff -> stormkeeper begincast
      {
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
      },
      {
        linkRelation: EVENT_LINKS.CallOfTheAncestors,
        linkingEventId: SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.id,
        linkingEventType: EventType.Summon,
        referencedEventId: [TALENTS.PRIMORDIAL_WAVE_TALENT.id, SPELLS.ANCESTRAL_SWIFTNESS_CAST.id],
        referencedEventType: EventType.Cast,
        forwardBufferMs: -1, // only look backwards
        backwardBufferMs: 5,
        anySource: true,
        anyTarget: true,
        maximumLinks: 1,
        isActive: (c) => c.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT),
        additionalCondition: (le: AnyEvent, re: AnyEvent) =>
          GetRelatedEvents(re, EVENT_LINKS.CallOfTheAncestors).length === 0,
      },
    ]);
    this.priority = NORMALIZER_ORDER.EventLink;
  }
}

export default EventLinkNormalizer;
