import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { NORMALIZER_ORDER } from '../../constants';

class EventOrderNormalizer extends BaseEventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      // ancestral swiftness cast needs to occur before the ancestor is summoned
      {
        afterEventId: SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.id,
        afterEventType: EventType.Summon,
        beforeEventId: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
        beforeEventType: EventType.Cast,
        anySource: true,
        anyTarget: true,
        bufferMs: 500,
        updateTimestamp: true,
        maxMatches: 1,
      },
      // Ascendance cast needs to occur before the buff is applied
      {
        beforeEventId: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
        beforeEventType: EventType.Cast,
        afterEventId: SPELLS.ASCENDANCE_ELEMENTAL_BUFF.id,
        afterEventType: EventType.ApplyBuff,
        anySource: true,
        anyTarget: true,
        bufferMs: 5,
        updateTimestamp: true,
        maxMatches: 1,
      },
    ]);

    this.priority = NORMALIZER_ORDER.EventOrder;
  }
}

export default EventOrderNormalizer;
