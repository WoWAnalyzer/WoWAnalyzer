import SPELLS from 'common/SPELLS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

class EventOrderNormalizer extends BaseEventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      {
        beforeEventId: SPELLS.LIGHTNING_BOLT.id,
        beforeEventType: [EventType.BeginCast, EventType.Cast],
        afterEventId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        afterEventType: EventType.RemoveBuff,
      },
    ]);
  }
}

export default EventOrderNormalizer;
