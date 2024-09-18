import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { NORMALIZER_ORDER } from '../../constants';

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      // stormkeeper applybuff -> stormkeeper begincast
      {
        linkRelation: 'stormkeeper',
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
    ]);
    this.priority = NORMALIZER_ORDER.EventLink;
  }
}

export default EventLinkNormalizer;
